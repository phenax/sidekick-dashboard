with import <nixpkgs> { };
let
  nixpkgs = import <nixpkgs> { };
  sidekickPkg = pkgs.callPackage ./default.nix { };
in
mkShell rec {
  buildInputs = [
    # Build tools
    sidekickPkg.rust
    nodePackages.pnpm

    # Lib deps
    pkg-config
    libclang
    # libGL

    # Dev
    nodePackages.nodemon
    rust-analyzer
  ];
  nativeBuildInputs = [ clang ];

  LIBCLANG_PATH = "${libclang.lib}/lib";
  # RUST_SRC_PATH = rust.packages.stable.rustPlatform.rustLibSrc;
  # LD_LIBRARY_PATH = lib.makeLibraryPath (buildInputs ++ nativeBuildInputs);
  # GIO_MODULE_DIR = "${glib-networking}/lib/gio/modules/";
}
