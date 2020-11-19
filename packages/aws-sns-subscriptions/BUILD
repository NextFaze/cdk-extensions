load("//:tools/defaults.bzl", "setup_ts_build")
load("//:tools/pkg.bzl", "cdkx_package")

package(default_visibility = ["//visibility:public"])

setup_ts_build(
    name = "library",
    module_name = "~/cdkx/aws-sns-subscriptions",
    deps = [
        "@npm//@types/aws-lambda",
    ],
)

cdkx_package(
    name = "aws-sns-subscriptions",
    readme_md = "README.md",
    deps = [
        ":library"
    ]
)