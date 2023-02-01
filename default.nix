{ stdenv, pkgs, rustPlatform, lib }:
with pkgs.lib;

let
  useFakeHash = true;
  commitHash = "f160ec9742cacd14f8853ea6d17dc4011f85156d";
  realSha256 = "sha256-LCFcX23dY7tFoXPgEHaD+U6g2X/9M4aE4TPfvhu6bLI=";

  src = pkgs.fetchFromGitHub {
    owner = "mozilla";
    repo = "nixpkgs-mozilla";
    rev = "15b7a05f20aab51c4ffbefddb1b448e862dccb7d"; # 10th April 2022
    sha256 = "sha256-YeN4bpPvHkVOpQzb8APTAfE7/R+MFMwJUMkqmfvytSk=";
  };
  moz = import "${src.out}/rust-overlay.nix" pkgs pkgs;
  rust = moz.latest.rustChannels.nightly.rust.override {
    extensions = [ "rust-src" ];
  };

  libDeps = with pkgs; [
    rust
    pkg-config
    libclang
    libGL
    at-spi2-atk
    pango
    gdk-pixbuf
    gtk3
    webkitgtk
    libsoup
  ];

  devShell = with pkgs; mkShell rec {
    buildInputs = libDeps ++ [
      nodePackages.pnpm
      nodePackages.nodemon
      nodePackages.typescript-language-server
      rust-analyzer
    ];
    nativeBuildInputs = [ clang ];

    LIBCLANG_PATH = "${libclang.lib}/lib";
    LD_LIBRARY_PATH = lib.makeLibraryPath (buildInputs ++ nativeBuildInputs);
    GIO_MODULE_DIR = "${glib-networking}/lib/gio/modules/";
  };
in
rustPlatform.buildRustPackage rec {
  pname = "sidekick-dashboard";
  version = "0.0.0";

  src = pkgs.fetchFromGitHub {
    owner = "phenax";
    repo = "sidekick-dashboard";
    rev = "main"; # commitHash;
    sha256 =
      if useFakeHash
      then lib.fakeSha256
      else realSha256;
  };

  cargoSha256 = lib.fakeSha256; # "sha256-dgW2SlpKovw79wkdGcbVm6c8KqkbcZlvZCwCcdVBShw=";

  nativeBuildInputs = with pkgs; [ cmake wrapQtAppsHook clang ];
  buildInputs = libDeps;

  passthru = {
    rust = rust;
    devShell = devShell;
  };
}
