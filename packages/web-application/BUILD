load("//:tools/defaults.bzl", "setup_ts_build", "setup_ts_test")
load("//:tools/jest.bzl", "jest_test")

package(default_visibility = ["//visibility:public"])

setup_ts_build(
    name = "library",
    module_name = "@cdkx/web-application",
    deps = [
        "@npm//@aws-cdk/aws-route53",
        "@npm//@aws-cdk/aws-certificatemanager",
        "@npm//@aws-cdk/aws-cloudfront",
        "@npm//@aws-cdk/aws-s3"
    ],
)

setup_ts_test(
    name = "test_library",
    deps = [
        ":library",
        "@npm//@aws-cdk/aws-route53",
        "@npm//@aws-cdk/aws-certificatemanager",
    ],
)

jest_test(
    name = "test",
    deps = [
        ":test_library",
    ],
)
