const gulp = require('gulp');
const merge2 = require('merge2');
const sass = require('gulp-sass')(require('sass'));
const $ = require('gulp-load-plugins')({ pattern: ['*', '!sass'] });
const isRemote = process.argv.indexOf('--remote') !== -1;
const isSync = process.argv.indexOf('--sync') !== -1;
const isDev = process.argv.indexOf('--dev') !== -1;
const isProd = !isDev;
const version = +isProd && Date.now();

// console.log(JSON.stringify($));
let pckg = require('./package.json');
let webconf = {
	output: {
		filename: 'common.js'
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			use: {
					loader: 'babel-loader',
					options: { presets: ['@babel/preset-env'] }
				}
		}]
	},
	mode: isDev ? 'development' : 'production',
	devtool: isDev ? 'eval-source-map' : false
};

let pth = {
	pbl: {
		root: './docs/',
		html: './docs/',
		js: './docs/',
		css: './docs/',
		img: './docs/images/',
		fnts: './docs/fonts/'
	},
	src: {
		root: './src/',
		html: './src/[^_]*.html',
		js: './src/js/common.js',
		css: './src/scss/style.scss',
		scss: './src/scss/lib/',
		// img: './src/images/**/!(icon-*.svg|shape-*.svg)',
		img: './src/images/!(icons|static){,/**}',
		static: './src/images/static/**/*',
		icn: './src/images/icons/**/*.svg',
		fnts: './src/fonts/**/*.*',
		tmpl: './src/templates/'
	},
	wtch: {
		html: './src/**/*.html',
		js: ['./src/js/**/*.js','./src/blocks/**/(*.js|*.json)'],
		css: ['./src/scss/**/*.scss','./src/blocks/**/*.scss'],
		img: ['./src/images/**', '!./src/images/icons/**'],
		static: './src/images/static/**/*',
		icn: './src/images/icons/**/*.svg',
		fnts: './src/fonts/**/*.*'
	}
};

function swallowError (error) {
	console.log(error.toString());
	this.emit('end');
}

function clear() {
	return $.del(pth.pbl.root + '*');
}

function root() {
	return gulp.src([
		'./src/*',
		'!./src/*.html',
	], { dot: true, nodir: true })
	.pipe(gulp.dest(pth.pbl.root));
}

function js() {
	return gulp.src(pth.src.js)
		.pipe($.webpackStream(webconf))
		.on('error', swallowError)
		.pipe(gulp.dest(pth.pbl.js))
		.pipe($.if(isSync, $.browserSync.stream()))
		.on('end', function() {
			if(isRemote) deploy(true, 'js');
		});
}

function jslib () {
	let paths = [];
	if (Object.keys(pckg.externalJs).length !== 0) {
		Object.entries(pckg.externalJs).forEach(function ([key, value], index) {
			paths[index] = `node_modules/${key}/${value}`;
		});

		return gulp.src(paths)
			.pipe(gulp.dest(pth.pbl.js));
	}
	return gulp.src('.', { allowEmpty: true });
}

function html() {
	return gulp.src(pth.src.html)
		.pipe($.fileInclude({ prefix: '@@', basepath: pth.src.tmpl }))
		.on('error', swallowError)
		.pipe($.if(isProd, $.typograf({
			locale: ['ru', 'en-US'],
			htmlEntity: { type: 'digit' },
			safeTags: [
				['<\\?php', '\\?>'],
				['<no-typography>', '</no-typography>'],
			],
		})))
		.on('error', swallowError)
		.pipe($.replace(/(\.(css|js)\?v=)\d+\b/g, `$1${version}`))
		.pipe(gulp.dest(pth.pbl.html))
		.pipe($.if(isSync, $.browserSync.stream()));
}

function styles() {
	return gulp.src(pth.src.css)
		.pipe($.if(isDev, $.sourcemaps.init()))
		.pipe($.globSass())
		.pipe(sass())
		.on('error', swallowError)
		.pipe($.autoprefixer({ 
			overrideBrowserslist: [ "last 4 version" ],
			cascade: false, 
			grid: true 
		}))
		.pipe($.if(isProd, $.groupCssMediaQueries()))
		.pipe($.if(isProd, $.cleanCss({
			compatibility: { properties: { zeroUnits: false }},
			level: 2
		})))
		.pipe($.if(isDev, $.sourcemaps.write()))
		.pipe(gulp.dest(pth.pbl.css))
		.pipe($.if(isSync, $.browserSync.stream()))
		.on('end', function() {
			if(isRemote) deploy(true, 'css');
		});
}

function images() {
	const processed = gulp.src(pth.src.img)
		.pipe($.newer(pth.pbl.img))
		.pipe($.webp())
		.pipe(gulp.dest(pth.pbl.img));

	const copied = gulp.src(pth.src.static)
		.pipe($.newer(pth.src.static))
		.pipe(gulp.dest(pth.pbl.img));

	return merge2(processed, copied)
		.pipe($.if(isSync, $.browserSync.stream()));
}

function icons() {
	return gulp.src(pth.src.icn)
	.pipe($.svgSprite({
		svg: { 
			xmlDeclaration: false,
			rootAttributes: { class: 'sprite' }
		},
		shape: {
			transform: [{
				svgo: {
					plugins: [
						{ name: 'preset-default' },
						{ name: 'removeAttrs', params: { attrs: '*:(fill|data-*|id|class|style|stroke)' }},
					]
				}
			}]
		},
		mode: {
			symbol: {
				dest: './',
				sprite: '_sprite.svg',
				example: ! isProd
			}
		}
	}))
	.on('error', swallowError)
	.pipe(gulp.dest(pth.src.tmpl))
};

function fonts() {
	return gulp.src(pth.src.fnts)
		.pipe($.newer(pth.pbl.fnts))
		.pipe($.fonter({
			formats: ['woff', 'ttf'],
			compound2simple: true
		}))		
		.pipe(gulp.dest(pth.pbl.fnts))
		.pipe($.ttf2woff2())
		.pipe(gulp.dest(pth.pbl.fnts))
		.pipe($.if(isSync, $.browserSync.stream()));
}

function deploy(e, ...args) {
	const conn = $.vinylFtp.create({
		host: pckg.ftp.host,
		user: pckg.ftp.user,
		password: pckg.ftp.password,
		parallel: 5,
		log: $.fancyLog
	});

	args = args.length ? args : ['js','css'];
	args.forEach(function(item, i) {
		this[i] = pth.pbl[item]+'*.'+item;
	}, args);

	if (process.argv.indexOf('--all') !== -1) {
		return gulp.src(pth.pbl.root+'**', {base: pth.pbl.root})
			.pipe(conn.newerOrDifferentSize(pckg.ftp.workdir))
			.pipe(conn.dest(pckg.ftp.workdir));
	} else {
		return gulp.src(args, {base: pth.pbl.root, buffer: false})
			.pipe(conn.newerOrDifferentSize(pckg.ftp.workdir))
			.pipe(conn.dest(pckg.ftp.workdir));
	}
}

function watch() {
	if(isSync) {
		$.browserSync.init({
			server: { baseDir: pth.pbl.root }
		});
	}
	gulp.watch(pth.wtch.js, js);
	gulp.watch(pth.wtch.html, html);
	gulp.watch(pth.wtch.css, styles);
	gulp.watch(pth.wtch.img, images);
	gulp.watch(pth.wtch.icn, icons);
	gulp.watch(pth.wtch.fnts, fonts);
}

const build = gulp.series(clear, gulp.parallel(root, html, js, jslib, styles, images, icons, fonts));

exports.build = build;
exports.watch = gulp.series(build, watch);
exports.deploy = gulp.series(build, deploy);