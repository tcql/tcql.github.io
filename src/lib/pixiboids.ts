import { Application, Container, Graphics, GraphicsContext, Ticker, type PointData } from 'pixi.js';
import { Stats } from 'pixi-stats';
import { formatRgb, filterBrightness, parse } from 'culori';
import { easeInCubic } from 'easing-utils';

// Graphics Context for holding the boid shape, shared by all boid Graphics.
// This is declared at the top level but gets reset in `main()`. Currently,
// when the pixi app is destroyed, it wipes out any attached contexts as well,
// so the context is lost if we actually initialize it here.
let baseBoidGraphic: GraphicsContext;

type CuloriObject = Object;

interface SeparationOptions {
	minDistanceMax: number;
	minDistanceMin: number;
	avoidFactor: number;
	maxNearby: number;
	nearbyAvoidFactor: number;
}
interface TrailOptions {
	historyLength: number;
	updateFrequency: number;
	maxWidth: number;
	minWidth: number;
	minOpacity: number;
}
interface PerformanceOptions {
	autoReduceBoids: boolean;
	autoReduceRate: number;
	minimumBoids: number;
	fpsTestWindow: number;
	fpsThreshold: number;
}
interface UpdateOptions {
	mainLoopFps: number;
	trailsLoopFps?: number;
	lifeLoopFps?: number;
	colorUpdateFps?: number;
}

interface BoidConfig {
	stats: boolean;
	numBoids: number;
	maxSpeed: number;
	centeringFactor: number;
	matchingFactor: number;
	speedWobbleChance: number;
	speedWobbleMax: number;
	visualRange: number;
	flockColors: string[];
	updates: UpdateOptions;
	trails: TrailOptions;
	separation: SeparationOptions;
	performance?: PerformanceOptions;
	computedStyle: CSSStyleDeclaration;
}

interface NearbyBoid {
	other: BoidController;
	distance: number;
}

interface BoidFn {
	(boid: BoidController, flock: Flock, delta: number): void;
}

function taxicabDistance({ x: x1, y: y1 }: PointData, { x: x2, y: y2 }: PointData): number {
	return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

/**
 * Return a random value that is plus-or-minus some factor
 */
function randPlusOrMinus(factor: number): number {
	return (Math.random() - 0.5) * 2 * factor;
}

/**
 * Tests if two points are within a threshold distance. Uses a taxicab distance first
 * to more inexpensively bail out.
 *
 * If within both thresholds, the distance is returned.
 * If not, -1 is returned
 */
function inThreshold(
	{ x: x1, y: y1 }: PointData,
	{ x: x2, y: y2 }: PointData,
	taxiThreshold: number,
	threshold: number
): number {
	const dx = Math.abs(x2 - x1);
	const dy = Math.abs(y2 - y1);
	if (dx + dy > taxiThreshold) {
		return -1;
	}
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist < threshold) {
		return dist;
	}
	return -1;
}

class Flock extends Container {
	config: BoidConfig;
	app: Application;
	id: number;
	color: string;

	constructor(config: BoidConfig, app: Application, id: number, ...rest: any[]) {
		super(...rest);
		this.config = config;
		this.app = app;
		this.id = id;
		this.color = config.flockColors[id];
	}

	makeBoid(): BoidController {
		const boid = new BoidController(this.config, this.app, this);
		const color = getColor(this.config, this.color);
		boid.baseColor = color;
		this.addChild(boid);
		return boid;
	}

	update(delta: number) {
		this.eachBoid((boid) => {
			boid.update(delta);
		});
	}

	eachBoid(fn: BoidFn, delta: number = 0) {
		const bound = fn.bind(this);
		this.children.forEach((boid) => {
			if (boid instanceof BoidController) {
				bound(boid, this, delta);
			}
		});
	}

	destroySome(count: number = 1) {
		for (let i = 0; i < count; i++) {
			this.children[i].destroy();
		}
	}
}

class BoidController extends Container {
	config: BoidConfig;
	app: Application;
	flock: Flock;

	boidGraphic: Graphics;
	trailGraphic: Graphics;

	dx: number = 0; // velocity in x
	dy: number = 0; // velocity in y
	positionWrapped: boolean = false; // whether this boid has been wrapped around the screen this frame
	baseColor: CuloriObject = parse('#ffffff');
	lastNearby: NearbyBoid[] = []; // results of most recent nearbyBoids check
	lastSpeed: number = 0.0;

	/**
	 * list of previous positions the boid has recently occupied. coordinates are inserted
	 * sequentially as x and then y. For exmaple, `trailPoints = [1, 7, 5, 6]` represents two
	 * locations, `{x: 1, y: 7}` and `{x: 5, y: 6}`
	 */
	trailPoints: number[] = [];

	/**
	 * @param {BoidConfig} config
	 * @param {Application} app
	 * @param {Flock} flock
	 * @param  {...any} rest
	 */
	constructor(config: BoidConfig, app: Application, flock: Flock, ...rest: any[]) {
		super(...rest);
		this.flock = flock;
		this.config = config;
		this.app = app;

		this.boidGraphic = this._makeBoidGraphic();
		this.trailGraphic = this._makeTrailGraphic();

		// Starting them all with positive velocities means they're all moving (roughly) in the same
		// direction, so behavior is more consistent and there's no groups pausing and negotiating
		// speed at the beginning / less jitter nonsense
		this.dx = Math.random() * (config.maxSpeed * 0.75); //randPlusOrMinus(config.maxSpeed * 0.75)
		this.dy = Math.random() * (config.maxSpeed * 0.75); //randPlusOrMinus(config.maxSpeed * 0.75)
	}

	_makeBoidGraphic(): Graphics {
		const { width, height } = this.app.screen;

		const graphic = new Graphics(baseBoidGraphic);

		graphic.position.set(Math.random() * width, Math.random() * height);
		this.addChild(graphic);
		return graphic;
	}

	_makeTrailGraphic(): Graphics {
		const graphic = new Graphics();
		this.addChild(graphic);
		return graphic;
	}

	clearTrail() {
		this.trailPoints = [];
		this.trailGraphic.clear();
	}

	updateTrail() {
		const { historyLength, minWidth, maxWidth, minOpacity } = this.config.trails;
		if (historyLength === 0) {
			return;
		}

		this.trailPoints.push(this.boidGraphic.x, this.boidGraphic.y);
		if (this.trailPoints.length > historyLength) {
			this.trailPoints.shift();
			this.trailPoints.shift();
		}

		const trail = this.trailGraphic;
		const len = this.trailPoints.length;
		let prev = { x: this.trailPoints[0], y: this.trailPoints[1] };
		let width = maxWidth;
		let color = `rgba(255 255 255 / 1)`;
		trail.clear().beginPath().moveTo(this.trailPoints[0], this.trailPoints[1]);

		for (let i = 2; i < this.trailPoints.length; i += 2) {
			const pct = 1.0 - (len - i) / len;
			const x = this.trailPoints[i];
			const y = this.trailPoints[i + 1];

			// If distance is not too large, draw the current segment
			if (taxicabDistance(prev, { x, y }) < 100) {
				width = Math.max(maxWidth * pct, minWidth);
				color = `rgba(255 255 255 / ${Math.max(pct, minOpacity)})`;
				trail.lineTo(x, y).stroke({ width, color });
			}
			trail.moveTo(x, y);
			prev = { x, y };
		}
	}

	update(delta: number) {
		const nearby = this.findNearbyInFlock();
		this.handleNearbyEffects(nearby);

		this.applySpeedWobble();
		this.applyVelocity(delta);
		this.wrapToScreen();
		this.lastNearby = nearby;
	}

	/**
	 * Handle all nearby boids checking in a single function
	 * to avoid looping over results multiple times
	 */
	handleNearbyEffects(nearby: NearbyBoid[]) {
		const numNeighbors = nearby.length;
		if (!numNeighbors) {
			return;
		}

		let centerX = 0;
		let centerY = 0;
		let moveX = 0;
		let moveY = 0;
		let avgDX = 0;
		let avgDY = 0;

		const { centeringFactor, matchingFactor } = this.config;
		const { minDistanceMin, minDistanceMax, maxNearby, nearbyAvoidFactor, avoidFactor } =
			this.config.separation;
		const avoidanceFactor = numNeighbors > maxNearby ? nearbyAvoidFactor : avoidFactor;

		for (let { other, distance } of nearby) {
			// match nearby velocities
			avgDX += other.dx;
			avgDY += other.dy;

			// move toward center of nearby boids
			centerX += other.boidGraphic.x;
			centerY += other.boidGraphic.y;

			// don't get too close to reaby neighbors
			const calcMin = minDistanceMin + Math.random() * (minDistanceMax - minDistanceMin);

			if (distance < calcMin) {
				moveX += this.boidGraphic.x - other.boidGraphic.x;
				moveY += this.boidGraphic.y - other.boidGraphic.y;
			}
		}

		centerX = centerX / numNeighbors;
		centerY = centerY / numNeighbors;
		avgDX = avgDX / numNeighbors;
		avgDY = avgDY / numNeighbors;

		this.dx +=
			(centerX - this.boidGraphic.x) * centeringFactor +
			moveX * avoidanceFactor +
			(avgDX - this.dx) * matchingFactor;
		this.dy +=
			(centerY - this.boidGraphic.y) * centeringFactor +
			moveY * avoidanceFactor +
			(avgDY - this.dy) * matchingFactor;
	}

	applySpeedWobble() {
		const { speedWobbleChance, speedWobbleMax } = this.config;
		if (Math.random() < speedWobbleChance) {
			this.dx += randPlusOrMinus(speedWobbleMax);
			this.dy += randPlusOrMinus(speedWobbleMax);
		}
	}

	/**
	 * Locates nearby boids in flock that are within visual range.
	 */
	findNearbyInFlock(): NearbyBoid[] {
		const { visualRange } = this.config;
		// using taxicab distance to do faster first-pass checks,
		// but since it's inaccurate, we'll buffer it a little so
		// we have fewer false negatives
		const taxiFactor = visualRange * 1.5;

		const nearby: NearbyBoid[] = [];
		this.flock.children.forEach((other) => {
			if (other instanceof BoidController && other !== this) {
				const dist = inThreshold(
					this.boidGraphic.position,
					other.boidGraphic.position,
					taxiFactor,
					visualRange
				);
				if (dist !== -1) {
					nearby.push({ other, distance: dist });
				}
			}
		});
		nearby.sort((a, b) => b.distance - a.distance);
		return nearby;
	}

	applyVelocity(delta: number) {
		// apply limit to velocities:
		// tood: is approx using taxicab more efficient? I think boids will generally wind up at or
		// near maxspeed pretty frequently, so skipping the approximation check might be faster
		const { maxSpeed } = this.config;
		const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

		if (speed > maxSpeed) {
			this.dx = (this.dx / speed) * maxSpeed;
			this.dy = (this.dy / speed) * maxSpeed;
			this.lastSpeed = maxSpeed;
		} else {
			this.lastSpeed = speed;
		}

		this.boidGraphic.x += this.dx * delta;
		this.boidGraphic.y += this.dy * delta;

		const angle = Math.atan2(this.dy, this.dx);
		this.boidGraphic.rotation = angle;
	}

	wrapToScreen() {
		this.positionWrapped = false;

		const { width, height } = this.app.screen;
		let { x, y } = this.boidGraphic.position;
		let wrappedX = true;
		let wrappedY = true;

		if (x > width) {
			x = 0;
		} else if (x < 0) {
			x = width;
		} else {
			wrappedX = false;
		}

		if (y > height) {
			y = 0;
		} else if (y < 0) {
			y = height;
		} else {
			wrappedY = false;
		}

		if (wrappedX || wrappedY) {
			this.positionWrapped = true;
			this.boidGraphic.position.set(x, y);
		}
	}
}

function getColor(config: BoidConfig, color: string): CuloriObject {
	return parse(config.computedStyle.getPropertyValue(color));
}

function initFlocks(app: Application, config: BoidConfig): Flock[] {
	const { numBoids, flockColors } = config;

	const flocks: Flock[] = [];
	for (let id = 0; id < flockColors.length; id++) {
		const flock = new Flock(config, app, id);
		app.stage.addChild(flock);
		flocks.push(flock);
	}

	for (let n = 0; n < numBoids; n++) {
		const flock = flocks[n % flocks.length];
		flock.makeBoid();
	}
	return flocks;
}

/**
 * Adds a ticker that does something to every boid at (approximately) a certain framerate
 */
function boidsTicker(fn: BoidFn, flocks: Flock[], fps: number = 60, minFps: number = 0): Ticker {
	const ticker = new Ticker();
	ticker.maxFPS = fps;
	if (minFps) {
		ticker.minFPS = minFps;
	}
	ticker.add(({ deltaMS }) => {
		flocks.forEach((flock) => flock.eachBoid(fn, 1.0 / deltaMS));
	});

	return ticker;
}

function configurePerformance(performance: PerformanceOptions, app: Application, flocks: Flock[]) {
	let fpses: number[] = [];

	app.ticker.add(({ FPS }) => {
		fpses.push(FPS);
		fpses = fpses.slice(-1 * performance.fpsTestWindow);
		if (fpses.length < performance.fpsTestWindow && FPS > 20) {
			return;
		}
		const sum = fpses.reduce((acc, x) => acc + x, 0);
		const avg = sum / fpses.length;

		if (avg < performance.fpsThreshold) {
			if (!performance.autoReduceBoids) {
				console.log('not destroying any boids ever');
				return;
			}
			const sumBoids = flocks.reduce((acc, f) => acc + f.children.length, 0);
			let target = sumBoids * performance.autoReduceRate;

			if (sumBoids - target < performance.minimumBoids) {
				target = Math.max(0, sumBoids - performance.minimumBoids);
				console.log('cant destroy more boids, near threshold. new target', target);
			}

			console.log('destroying ~', Math.ceil(target), 'boids out of', sumBoids, 'for performance');
			flocks.forEach((flock) => {
				flock.destroySome(Math.ceil(target / flocks.length));
			});
			fpses = [];
		}
	});
}

function configureBaseBoidGraphic(): GraphicsContext {
	const ctx = new GraphicsContext();
	ctx
		.moveTo(6, 0)
		.lineTo(0, 2)
		.lineTo(-8, 2)
		.lineTo(-8, -2)
		.lineTo(0, -2)
		.lineTo(6, 0)
		.fill(0xffffff);
	return ctx;
}

/**
 * Initialize the Pixi application
 * @param {HTMLElement} canvas
 * @param {BoidConfig} config
 */
export async function main(canvas: HTMLElement, config: BoidConfig): Promise<Application> {
	let app = new Application();
	await app.init({ resizeTo: canvas });
	app.stage.eventMode = 'none';

	if (config.stats) {
		new Stats(app.renderer, canvas);
	}

	baseBoidGraphic = configureBaseBoidGraphic();
	const flocks = initFlocks(app, config);

	app.ticker.maxFPS = config.updates.mainLoopFps;

	app.ticker.add(({ deltaMS, FPS }) => {
		// TODO only update if change?
		const color = getColor(config, '--color-neutral');
		app.renderer.background.color = formatRgb(color);
		flocks.forEach((flock) => flock.update(1.0 / deltaMS));
	});

	// Update boid trails
	boidsTicker((boid) => boid.updateTrail(), flocks, config.updates.trailsLoopFps).start();

	// Update colors
	boidsTicker(
		(boid, flock, delta) => {
			const color = getColor(flock.config, flock.color);
			boid.baseColor = color;
		},
		flocks,
		config.updates.colorUpdateFps || 10,
		1
	).start();

	boidsTicker(
		(boid, flock, delta) => {
			// do life !
			// const nearby = boid.lastNearby;
			// const pct = Math.max(Math.min(nearby.length, 18) / 20, 0.2);
			const pct = Math.max(easeInCubic(boid.lastSpeed / config.maxSpeed), 0.25);

			const filter = filterBrightness(pct);
			boid.tint = formatRgb(filter(boid.baseColor));
		},
		flocks,
		config.updates.lifeLoopFps || 30
	).start();

	if (config.performance) {
		configurePerformance(config.performance, app, flocks);
	}

	return app;
}
