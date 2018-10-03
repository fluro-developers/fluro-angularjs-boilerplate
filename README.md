# fluro angular boilerplate
Starter kit for building a fluro angular app

# Getting Started
Clone boilerplate repository
~~~~
git clone git@bitbucket.org:CadeEmbery/fluro-angular-boilerplate.git MYAPPLICATIONNAME
~~~~

Create a new repository for your project, then set remote url to new repository
~~~~
git remote set-url origin git@bitbucket.org:USERNAME/PROJECT_NAME.git
~~~~

Once you have cloned the repository change into the directory where you cloned to and install node packages
~~~~
cd MYAPPLICATIONNAME
npm install
~~~~

And install frontend all bower components
~~~~
bower install
~~~~

# Starting Grunt and developing
Once bower and node packages have been installed start grunt using
~~~~
grunt
~~~~

This will start watching changes in style.scss file, all .js, .html and .scss files located anywhere in the 'build/components' or 'build/routes' folder, Any changes will automatically trigger SCSS, Javascript HTML into their respective files in your '/app' directory, this will also start a livereload service in your browser window, saving you from hitting that refresh button. Woo hoo!.
You will be able to run your application and view your changes in realtime in the browser by visiting http://0.0.0.0:9001 or http://localhost:9001

# App and Boilerplate Structure


~~~~
/build/app.js
~~~~
Your primary app configuration files.  This is where you should add your own custom angular modals or other app specific stuff.  



~~~~
/build/boilerplate.js
~~~~
Some helpful boilerplate stuff we find useful, feel free to change this up or remove it if you want to do your own thing.

~~~~
/build/routes.js
~~~~
A lean mean listing of each of your site routes. (Angular UI Router is installed by default) add any new routes and configuration in here


# Route Structure

We recommend having each route in it's own folder. Any route specific javascript, html and scss files will be watched by our grunt script
and will compile automatically as you make changes

~~~~
/build/routes/home.html
/build/routes/home.scss
/build/routes/HomeController.js
~~~~
HomeController.js file is where you should put:
1. Route Controller function
2. route.data
3. route.resolve
4. route.params


# Packaging for final distribution
~~~~
grunt build
~~~~

This will concatenate, compile, compress, minify and copy your publishable application into the 'dist' directory ready to be deployed onto Fluro


# Deploying to Fluro
You can now commit and push to your remote git repository.
Then create or redeploy an existing deployment at https://admin.fluro.io/deployment


Happy coding!
