desc 'Launch the testing server on port 4000'
task :server do
  cd 'test' do
    `serve` # Requires http://github.com/jlong/serve
  end
end

desc 'Remove the dist directory'
task :clean do
  rm_rf 'dist'
end

desc 'Assemble files for distribution'
task :package => [:clean] do
  mkpath 'dist'
  readme = IO.read('README')
  readme = "/*\n" + readme.split("\n").map { |line| " * #{line}" }.join("\n") + "\n *\n */\n\n"
  statusjs = IO.read('src/javascripts/toggle.js')
  open('dist/toggle.js', 'w') do |f|
    f.write(readme + statusjs)
  end
end