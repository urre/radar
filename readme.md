# Technology Radar

A simple technology radar map (made famous by [http://www.thoughtworks.com/radar](Thoughtworks).

Work in progress...

## Make your own radar

Fork this repo

	``git@github.com:urre/radar.git``

### Add user info

This is displayed in the header showing your Gravatar and name with link to Twitter.

	{ "user":
	    [
	        {
	            "name": "Urban Sandén",
	            "email": "hej@urre.me",
	            "twitter": "urre"
	        }
	    ]
	}

### Add blips

Edit ``blips.json`` like this. Areas: techniques, tools, frameworks, platforms. Statuses: hold, assess, trial, adopt.

	{ "blips":
	    [
	        {
	            "title": "Node.js",
	            "area": "platforms",
	            "status": "trial",
	            "link": "http://nodejs.org"
	        },

### Publish

+ Publish to Github Pages by using the ``gh-pages`` branch
+ Fire up a browser and go to http://yourusername.github.io!

### Demo?

[Demo](http://urre.github.io/radar)