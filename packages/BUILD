load("//:tools/defaults.bzl", "setup_ts_build")
load("//:tools/jest.bzl", "jest_test")

package(default_visibility = ["//visibility:public"])

setup_ts_build(
    name = "library",
    module_name = "@cdk_extensions/all",
    deps = [],
)

jest_test(
    name = "test",
    deps = [
        ":library",
    ],
)
