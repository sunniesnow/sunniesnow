#!/usr/bin/env ruby

require 'json'

scripts_JSON = File.read 'json/scripts.json'
scripts = JSON.parse scripts_JSON, symbolize_names: true
scripts[:npmScripts].each do |script|
	name, variable = script[:path].match(%r{^(@?[a-z0-9\-\./]+)@\$(\w+)}).captures
	old_version = scripts[:npmLock][variable.to_sym]
	version = `npm view #{name} version`.chomp
	next if version == old_version
	puts "#{name}: #{old_version} -> #{version}"
	scripts_JSON.sub! %{"#{variable}": "#{old_version}"}, %{"#{variable}": "#{version}"}
end
File.write 'json/scripts.json', scripts_JSON
