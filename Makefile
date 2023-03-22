.PHONY: setup build

setup:
	cd nix && node2nix -i ../package.json --nodejs-18

clean:
	rm -rf ./dist/ ./node_modules/

build:
	nix-build

