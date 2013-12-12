#!/usr/bin/env ruby

if ARGV.length != 2
  puts 'Usage: checkout_git_repositories.rb <git server> <directory>'
  exit 1
end

$git_server = ARGV[0];
$repositories_directory = ARGV[1];

if !File.directory?($repositories_directory)
  puts "Directory does not exist and should be created first: #{repositories_directory}"
  exit 2
end


def checkout_repositories()
  confsDirectory = $repositories_directory + '/gitolite-admin/conf/subs'
  puts "Checking out repositories: #{confsDirectory}"

  Dir.foreach(confsDirectory) do |confFile|
    next if confFile == '.' or confFile == '..'
    parse_file("#{confsDirectory}/#{confFile}")
  end
end

def parse_file(confFile)
  puts "Processing file: #{confFile}"

  f = File.open(confFile)
  f.each do |line|
    next if !line.start_with?('repo ')
    repository = line[5..-1]
    checkout_repository(repository, false)
  end
end

def checkout_repository(repository, pull_if_exists)
  puts "Checking out repository: #{repository}"

  directory = $repositories_directory + '/' + repository;
  exists = File.directory?(directory);
  if exists
    if pull_if_exists
      git_pull(repository, directory)
    end
  else
    git_clone(repository, directory)
  end
end

def git_pull(repository, directory)
  puts "Git pull #{repository} in #{directory}"
  `cd #{directory} && git pull`
end

def git_clone(repository, directory)
  puts "Git clone #{repository} into #{directory}"
  `git clone git@#{$git_server}:#{repository} #{directory}`
end


checkout_repository('gitolite-admin', true)
checkout_repositories()