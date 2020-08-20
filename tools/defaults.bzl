load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")
load("@rules_pkg//:pkg.bzl", "pkg_tar")

def setup_ts_build(name, deps = [], **kwargs):
    """ Sets up default build configuration to compile ts sources with npm hosted deps        
        @param name - name of the target (required)
        @param deps - list of internal targets that this build relies on
                    - external npm deps is already been taken care of
    """

    ts_library(
        name = name,
        srcs = native.glob(
            [
                "**/*.ts",
            ],
            exclude = ["**/*.spec.ts"],
        ),
        tsconfig = "//:tsconfig.json",
        deps = deps + [
            "@npm//:node_modules",
        ],
        **kwargs
    )

def gen_bundle(name, deps, dir_name = "", srcs = []):
    """Generate tar containing bundled js.
        index.ts must exist next to BUILD file
        rollup.config.js must exist next to WORKSPACE
        This will create "bundle" js under specified dir_name
    """
    rollup_bundle(
        name = "bundle",
        srcs = [
            "//:package.json",
        ],
        config_file = "//:rollup.config.js",
        entry_point = ":index.ts",
        format = "cjs",
        deps = deps,
    )

    pkg_tar(
        name = name,
        srcs = srcs + [
            ":bundle",
        ],
        extension = "tar.gz",
        package_dir = dir_name,
    )

def gen_artifacts(name, srcs, configs, deps):
    """Generate Artifacts for multiple environments.
    """

    app_srcs = []
    cmd = ""

    for env in configs:
        config = configs[env]
        native.genrule(
            name = "config_%s" % (env),
            srcs = [
                config,
            ],
            outs = [
                env + "/config.json",
            ],
            cmd = "cp $< $@",
        )

        pkg_tar(
            name = "app_" + env,
            srcs = srcs + [":config_%s" % (env)],
            extension = "tar.gz",
            package_dir = env,
            deps = deps,
        )

        cmd += "tar -xzf $(location :app_%s) && " % (env)
        app_srcs.append(":app_%s" % (env))

    cmd += "zip -rq $@ * -x \"*bazel-out*\" -x \"*external*\""

    native.genrule(
        name = "zip",
        srcs = app_srcs,
        outs = [
            name + ".zip",
        ],
        cmd = cmd,
    )