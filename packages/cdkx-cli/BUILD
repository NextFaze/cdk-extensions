load("@build_bazel_rules_nodejs//:index.bzl", "pkg_npm")
load("//:tools/defaults.bzl", "setup_ts_build", "setup_ts_test")
load("//:tools/pkg.bzl", "cdkx_package")
load("//:tools/jest.bzl", "jest_test")

package(default_visibility = ["//visibility:public"])

setup_ts_build(
    name = "library",
    module_name = "@cdkx/cli",
    deps = [
        "@npm//figlet",
        "@npm//chalk",
        "@npm//commander",
        "@npm//@types/figlet"
    ]
)

# cdkx_package(
#     name = "cli",
#     readme_md = "README.md",
#     deps = [
#         ":library"
#     ]
# )