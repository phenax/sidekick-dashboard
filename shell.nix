with import <nixpkgs> { };
let
  nixpkgs = import <nixpkgs> { };
  sidekickPkg = pkgs.callPackage ./default.nix { };

  libDeps = sidekickPkg.libDeps;

  devDeps = [
    nodePackages.pnpm
    nodePackages.nodemon
    rust-analyzer
  ];
in
mkShell rec {
  buildInputs = libDeps ++ devDeps;
  nativeBuildInputs = [ clang ];

  LIBCLANG_PATH = "${libclang.lib}/lib";
  LD_LIBRARY_PATH = lib.makeLibraryPath (buildInputs ++ nativeBuildInputs);
  GIO_MODULE_DIR = "${glib-networking}/lib/gio/modules/";
}
