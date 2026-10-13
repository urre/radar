# Technology Radar

A simple technology radar map (made famous by [Thoughtworks](https://www.thoughtworks.com/radar)).

> ## [Demo](https://urre.github.io/radar)

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Make your own radar

Fork/clone this repo

	git clone git@github.com:urre/radar.git

### Run locally

The page loads its data with `fetch`, so serve it over HTTP instead of opening the file directly. Any static server works, for example:

	python3 -m http.server 8000

Then open http://localhost:8000.

### Add user info

Edit `user.json`. This is displayed in the header showing your Gravatar and your name with a link to your website. You can optionally set `background` to a custom header image.

	{ "user":
	    [
	        {
	            "name": "Urban Sandén",
	            "email": "hej@urre.me",
	            "website": "https://urre.me"
	        }
	    ]
	}

### Add blips

Edit `blips.json` like this. Areas: techniques, tools, frameworks, platforms. Statuses: hold, assess, trial, adopt.

	{ "blips":
	    [
	        {
	            "title": "Node.js",
	            "area": "platforms",
	            "status": "trial",
	            "link": "https://nodejs.org"
	        },

### Files

+ `index.html` – markup
+ `css/radar.css` – styles
+ `js/radar.js` – loads the JSON files, places the blips, tooltips and the radar/list toggle

### Publish

+ Publish using [GitHub Pages](https://pages.github.com/) by using the `gh-pages` branch.
+ Fire up a browser and go to https://yourusername.github.io/radar

Or simply just host it on your own server.

### Changelog

#### 2.0.0
+ Removed Gulp, Bower, Sass and all JavaScript libraries (jQuery, Handlebars, Switchery, FastClick, md5). Plain HTML/CSS/JS
+ Radar circle is shown on all screen sizes, with a toggle to switch to the list
+ Removed the header pattern
+ Blip titles and links are escaped and only `http(s)` links are allowed
+ All external resources load over HTTPS, added a Content Security Policy
+ Removed Twitter widget and GitHub button iframe

#### 1.2.0
+ New color scheme, new default background svg image
+ Use user website instead of Twitter profile url

#### 1.1.0
+ Added possiblity to add custom header image
+ Added layout switcher and list style for smaller screens
+ Blip hovering from the lists

#### 1.0.0
+ First version published

### License
Copyright (c) 2014 Urban Sanden. Licensed under the MIT license.
