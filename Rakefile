desc 'Launch the testing server on port 4000'
task :demo do
  `open demo.html`
end

desc 'Remove the dist directory'
task :clean do
  rm_rf 'dist'
end

file 'dist/toggle.js' => ['README', 'src/javascripts/toggle.js'] do |t|
  target = t.name
  unless uptodate?(target, t.prerequisites)
    readme = IO.read(t.prerequisites.first)
    readme = "/*\n" + readme.split("\n").map { |line| " * #{line}" }.join("\n") + "\n *\n */\n\n"
    togglejs = IO.read(t.prerequisites.last)
    open(target, 'w') do |f|
      f.write(readme + togglejs)
    end
  end
end

file 'dist/toggle.min.js' => 'src/javascripts/toggle.js' do |t|
  gem 'jsmin'
  require 'jsmin'
  target = t.name
  src = t.prerequisites.first
  unless uptodate?(target, src)
    togglejs = IO.read(src)
    open(target, 'w') do |f|
      f.write(JSMin.minify(togglejs).strip)
    end
  end
end

task 'mkdist' do
  mkpath 'dist'
end

desc 'Assemble files for distribution'
task :dist => [:mkdist, 'dist/toggle.js', 'dist/toggle.min.js']

desc 'Build documentation from source'
task :doc do
  gem 'treetop', '= 1.2.6' # PDoc seems to require this version right now
  gem 'pdoc', '0.2.0'
  require 'pdoc'
  rm_rf 'doc'
  mkpath 'doc'
  files = FileList['src/javascripts/*.js']
  files.exclude('prototype.js', 'effects.js', 'lowpro.js')
  PDoc.run(
    :source_files => files,
    :destination => 'doc',
    :index_page => 'README',
    :syntax_highlighter => :pygments,
    :markdown_parser => :bluecloth
  )
end