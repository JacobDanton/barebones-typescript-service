.DEFAULT_TARGET: default
.PHONY: default

# Default Make target is the default Gulp target
default: npm tsd
	@gulp

# Install NPM modules if they do not exist
npm:
	@if [ ! -d "./node_modules" ] ; then npm install ; fi

# Reinstall TSD typings if they do not exist
tsd: npm
	@if [ ! -d "./typings" ] ; then tsd reinstall && tsd rebundle ; fi

# Ignore Makefile target
Makefile: ;

# Clean up compile and test products
clean:
	@rm -rf build coverage tmp

# Clean up NPM packages
clean-npm:
	@rm -rf node_modules

# Clean up TSD definitions
clean-tsd:
	@rm -rf typings

# Clean up everything
nuke: clean clean-tsd clean-npm;

# For all other targets, redirect to gulp
%: npm tsd
	@gulp $@
