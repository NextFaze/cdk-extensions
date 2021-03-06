#FIXME testing with jest is not yet officially supported by bazel, for now just use jest cli directly
load("@npm//jest:index.bzl", "jest", _jest_test = "jest_test")

def jest_test(name, deps = [], jest_config = "//:jest.config.js", **kwargs):
    "A macro around the auto generated jest_test rule"
    templated_args = [
        "--no-cache",
        "--no-watchman",
        "--ci",
        "--colors",
    ]
    templated_args.extend(["--config", "$(rootpath %s)" % jest_config])
    srcs = native.glob(
        ["**/*.test.js", "**/*.spec.js"],
    )
    snapshots = native.glob(
        ["__snapshots__/*.snap"],
    )
    for src in srcs:
        templated_args.extend(["--runTestsByPath", "$(rootpath %s)" % src])

    data = [jest_config] + srcs + deps + ["//:jest-reporter.js", "//:babel.config.js", "@npm//@babel/preset-env"] + snapshots
    _jest_test(
        name = name,
        data = data,
        templated_args = templated_args,
        **kwargs
    )

    # This rule is used specifically to update snapshots via `bazel run`
    jest(
        name = "%s.update" % name,
        data = data,
        templated_args = templated_args + ["-u"],
        **kwargs
    )
