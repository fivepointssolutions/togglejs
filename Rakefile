desc 'Launch the testing server on port 4000'
task :demo do
  cd 'demo' do
    `serve` # Requires http://github.com/jlong/serve
  end
end

desc 'Remove the dist directory'
task :clean do
  rm_rf 'dist'
end

desc 'Assemble files for distribution'
task :dist => [:clean] do
  mkpath 'dist'
  readme = IO.read('README')
  readme = "/*\n" + readme.split("\n").map { |line| " * #{line}" }.join("\n") + "\n *\n */\n\n"
  statusjs = IO.read('src/javascripts/toggle.js')
  open('dist/toggle.js', 'w') do |f|
    f.write(readme + statusjs)
  end
end

## This doesn't seem to be working at the moment:
# desc 'Build documentation from source'
# task :doc do
#   require 'rubygems'
#   gem 'pdoc'
#   require 'pdoc'
#   rm_rf 'doc'
#   mkpath 'doc'
#   files = FileList['src/javascripts/*.js']
#   files.exclude('prototype.js', 'effects.js', 'lowpro.js')
#   PDoc.run(
#     :source_files => files,
#     :destination => 'doc',
#     # :index_page => 'README.markdown',
#     :syntax_highlighter => :pygments,
#     :markdown_parser => :bluecloth
#   )
# end