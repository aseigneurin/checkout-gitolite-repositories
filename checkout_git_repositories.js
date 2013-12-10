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

checkoutRepository('gitolite-admin', true, function() {
  checkoutRepositories();
});


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

function checkoutRepository(repository, pullIfExists, callback) {
  console.log('Checking out repository: ' + repository);

  var directory = repositoriesDirectory + '/' + repository;
  fs.exists(directory, function(exists) {
    if (exists) {
      if (pullIfExists) {
        gitPull(repository, directory, callback);
      }
    } else {
      gitClone(repository, directory, callback);
    }
  });
}

function gitPull(repository, directory, callback) {
  console.log('Git pull ' + repository + ' in ' + directory);

  var options = {
    cwd: directory
  };
  git(['pull'], callback, options);
}

function gitClone(repository, directory, callback) {
  console.log('Git clone ' + repository + ' into ' + directory);

  git(['clone', 'git@' + gitServer + ':' + repository, directory], callback);
}

function git(args, callback, options) {
  var child_process = require('child_process');
  var git = child_process.spawn('git', args, options);

  git.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
  });

  git.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
  });

  git.on('exit', function(code) {
    if (code != 0) {
      console.log('Child process exited with exit code ' + code);
    }
    if (typeof(callback) === 'function') {
      callback();
    }
  });
}