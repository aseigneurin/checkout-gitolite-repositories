var Fiber = require("fibers");
var Future = require("fibers/future"),
  wait = Future.wait;
var fs = require('fs');

if (process.argv.length != 4) {
  console.log('Usage: node checkout_git_repositories <git server> <directory>');
  process.exit(1);
}

var gitServer = process.argv[2];
var repositoriesDirectory = process.argv[3];

if (!fs.existsSync(repositoriesDirectory)) {
  console.warn('Directory does not exist and should be created first: ' + repositoriesDirectory);
  process.exit(2);
}

checkoutRepository('gitolite-admin', true);
checkoutRepositories();


function checkoutRepositories() {
  var confsDirectory = repositoriesDirectory + '/gitolite-admin/conf/subs';
  console.log('Checking out repositories: ' + confsDirectory);

  fs.readdir(confsDirectory, function(err, files) {
    if (err) {
      console.log('Error: ' + err);
      process.exit(1);
    }
    files.forEach(function(confFile) {
      parseFile(confsDirectory + '/' + confFile);
    });
  });
}

function parseFile(confFile) {
  console.log('Processing file: ' + confFile);

  var lineByLineReader = require('line-by-line');
  var lr = new lineByLineReader(confFile);

  lr.on('error', function(err) {
    console.log('Error reading file ' + confFile + ': ' + err);
  });

  lr.on('line', function(line) {
    if (line.indexOf('repo ') == 0) {
      var repository = line.substring(5);
      checkoutRepository(repository, false);
    }
  });
}

function checkoutRepository(repository, pullIfExists) {
  console.log('Checking out repository: ' + repository);

  var directory = repositoriesDirectory + '/' + repository;
  var exists = fs.existsSync(directory);
  if (exists) {
    if (pullIfExists) {
      gitPull(repository, directory);
    }
  } else {
    gitClone(repository, directory);
  }
}

function gitPull(repository, directory) {
  console.log('Git pull ' + repository + ' in ' + directory);

  var options = {
    cwd: directory
  };
  git(['pull'], options);
}

function gitClone(repository, directory) {
  console.log('Git clone ' + repository + ' into ' + directory);

  git(['clone', 'git@' + gitServer + ':' + repository, directory]);
}

function git(args, options) {
  var future = new Future;

  var child_process = require('child_process');
  var git = child_process.spawn('echo', args, options);

  git.stdout.on('data', function(data) {
    //console.log('stdout: ' + data);
  });

  git.stderr.on('data', function(data) {
    //console.log('stderr: ' + data);
  });

  git.on('exit', function(code) {
    if (code != 0) {
      console.log('Child process exited with exit code ' + code);
    }
    future.
    return ();
  });

  future.resolve(function() {});
}