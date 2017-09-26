# mbed build for Atom (via atom-build)

Uses the [atom-build](https://github.com/noseglid/atom-build) package to execute
[mbed-cli](https://github.com/ARMmbed/mbed-cli) builds in the
[Atom](https://atom.io/) editor.

## Prerequisites

In general a working installation of the [mbed-cli](https://github.com/ARMmbed/mbed-cli)
is required. For instructions on the setup
visit the `mbed-cli`
[project page](https://github.com/ARMmbed/mbed-cli#installing-mbed-cli).

The `atom-build-mbed` package itself requires
[atom-build](https://github.com/noseglid/atom-build) e.g. installable through
`apm` from the command line:

    apm install build

Optionally (but recommended) to display compile errors and warnings nicely,
add the [linter](https://atom.io/packages/linter) package:

    apm install linter

## Install

Install the mbed builder from the package sources:

    apm install build-mbed

Or install from git:

    cd $HOME/.atom/packages
    git clone https://github.com/wendlers/atom-build-mbed.git build-mbed

## Usage

See [atom-build](https://github.com/noseglid/atom-build) for all available
key-bindings of the builder.

Triggering / activation of this builder is done by existence of the file
`mbed_settings.py` in the current projects directory.

The builder utilizes the `compile` sub-command of the `mbed-cli` described
[here](https://github.com/ARMmbed/mbed-cli#compiling-code). Targets exposed by
the builder are (select by pressing `F7`, (re-)execute with `F9`):

* _mbed: release_: perform release build which is the equivalent of
  `mbed compile` on the command line.
* _mbed: release (clean build)_: same as above but with added `-c` switch
  to force a full rebuild. The command line equivalent would be
  `mbed compile -c`.
* _mbed: debug_: use the debugging profile for the build (which adds debug
  symbols to the binary). This is the same as `mbed compile --profile mbed-os/tools/profiles/debug.json` on the command line.
* _mbed: debug (clean build)_: same as above but with added `-c` switch
  to force a full rebuild. The command line equivalent would be
  `mbed compile -c --profile mbed-os/tools/profiles/debug.json`.
* _mbed: clean_: remove the build directory. On the command line this
  would be done by `rm -fr BUILD`.

The default target is _mbed: release_.

You could provide per project targets by creating the file `targets.ini`
alongside the `mbed_settings.py` script. Each target is defined by `[targetname]`,
followed by an entry specifying the parameters which should be passed to `mbed`:

    [fw_one release]
    params="--source fw_one --source mbed-os --source common --build BUILD/fw_one"

    [fw_one release (debug)]
    params="--source fw_one --source mbed-os --source common --build BUILD/fw_one --profile mbed-os/tools/profiles/debug.json"

    [fw_two release]
    params="--source fw_two --source mbed-os --source common --build BUILD/fw_two"

    [fw_two release (debug)]
    params="--source fw_two --source mbed-os --source common --build BUILD/fw_two --profile mbed-os/tools/profiles/debug.json"

The above example allows to build two different firmwares (one located in `fw_one`, the other in `fw_two`), sharing
common parts (here `mbed-os` and `common`).

Please note, that when you created a `targets.ini` initially for your project,
you need to advice `atom-build` to refresh targets with `Build: Refresh Targets`.
Once `atom-build` is aware of the user targets, they will be refresh automatically
every time the `targets.ini` is saved.

Within the settings dialog of the builder the following could be adjusted:

* _verbosity_: depending on the settings, this adds `--verbose` or
  `--very_verbose` to the `mbed` call.
* _jobs_: number of parallel jobs. If > 1, this will add `-j <NUM_JOBS>` to the
  `mbed` call.
* _build dir_: if set != `default`, the output directory will be set to this
  (instead of using the mbed default which is `BUILD`). This will add
  `--build <BUILD_DIR>` to the `mbed` call.
* _source dir_: if set != `default`, the source directory will be set to this
  (instead of using the mbed default which is the current project directory).
  This will add `--source <SOURCE_DIR>` to the `mbed` call.
* _mcu_: if set != `default`, the MCU will be set to this.
  This will add `-m <MCU>` to the `mbed` call.
* _toolchain_: if set != `default`, the toolchain will be set to this.
  This will add `-t <TOOLCHAIN>` to the `mbed` call.
