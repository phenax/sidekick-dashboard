{ pkgs ? import <nixpkgs> { } }:
with pkgs;

let
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

  nodejs = nodejs-18_x;
  nodePkgs = import ./nix/default.nix { inherit nodejs; };

  libDeps = with pkgs; [
    # rust
    nodejs
    pkg-config
    libclang
    libGL
    at-spi2-atk
    pango
    gdk-pixbuf
    gtk3
    webkitgtk
    libsoup
    dbus
    cairo
    openssl_3
    glib
    appimagekit
  ];

  devShell = with pkgs; mkShell rec {
    buildInputs = libDeps ++ [
      rust
      nodePackages.pnpm
      nodePackages.nodemon
      nodePackages.typescript
      nodePackages.typescript-language-server
      rust-analyzer
      node2nix
    ];
    nativeBuildInputs = [ clang ];

    LD_LIBRARY_PATH = lib.makeLibraryPath (buildInputs ++ nativeBuildInputs);
  };
in
rustPlatform.buildRustPackage rec {
  pname = "sidekick-dashboard";
  version = "0.0.0";

  srcs = ./.;
  sourceRoot = "sidekick-dashboard/src-tauri";

  cargoSha256 = "sha256-La+5eHdud1zSgXGugHHPKVH1GXdeeeOhzXuzVOHxK+w=";

  nativeBuildInputs = with pkgs; [ cmake clang pkg-config ];
  buildInputs = libDeps ++ [ nodePkgs.nodeDependencies ];

  preBuild =
    let
      nodeModulesPath = "${nodePkgs.nodeDependencies}/lib/node_modules";
      npm = "${nodejs}/bin/npm";
    in
    ''
      cd ..;
      chmod 755 -R .;
      ln -s "${nodeModulesPath}" node_modules;
      ${npm} --offline run build;
      cd src-tauri;
    '';

  passthru = {
    rust = rust;
    devShell = devShell;
  };
}
