checkout-gitolite-repositories
==============================
A script that does a checkout of all the repositories on a [gitolite](http://gitolite.com/) server.

There are 2 implementations:
- one in Javascript using [Node.js](http://nodejs.org/)
- on in Ruby

This assumes:
- The gitolite-admin repository is accessible through git@&lt;server&gt;:gitolite-admin
- [Subconfs](http://gitolite.com/gitolite/deleg.html) are used, hence configuration files can be found at conf/subs/\*.conf
- The user has read access to all the repositories (including the gitolite-admin repository)

## Usage

Ruby:

    checkout_git_repositories.rb <git server> <directory>

Node.js:

    node checkout_git_repositories.js <git server> <directory>
