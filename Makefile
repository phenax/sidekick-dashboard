.PHONY: setup build

setup:
	cd nix && node2nix -i ../package.json --nodejs-18

build:
	nix-build

