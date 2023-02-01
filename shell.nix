let
  nixpkgs = import <nixpkgs> { };
in
(nixpkgs.callPackage ./default.nix { }).devShell
