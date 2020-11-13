load("@build_bazel_rules_nodejs//:index.bzl", "pkg_npm")
load("//:tools/defaults.bzl", "setup_ts_build", "setup_ts_test")
load("//:tools/pkg.bzl", "cdkx_package")
load("//:tools/jest.bzl", "jest_test")

package(default_visibility = ["//visibility:public"])

setup_ts_build(
    name = "library",
    module_name = "~/cdkx/web-application",
    deps = [
        "@npm//@aws-cdk/aws-route53",
        "@npm//@aws-cdk/aws-certificatemanager",
        "@npm//@aws-cdk/aws-cloudfront",
        "@npm//@aws-cdk/aws-s3",
        "@npm//@aws-cdk/aws-ssm",
        "@npm//@aws-cdk/aws-iam",
        "@npm//@aws-cdk/aws-cloudfront-origins",
        "@npm//@aws-cdk/aws-apigateway",
        "@npm//@aws-cdk/aws-lambda-nodejs",
        '@npm//@aws-cdk/aws-lambda',
        "@npm//busboy",
        "@npm//sharp",
        "@npm//aws-sdk",
        "@npm//mime",
        "@npm//@types/mime",
        # types
        "@npm//@types/busboy",
        "@npm//@types/aws-lambda",
        "@npm//@types/sharp",
    ],
)

# Using jest test 
# setup_ts_test(
#     name = "test_library",
#     deps = [
#         ":library",
#         "@npm//@aws-cdk/aws-route53",
#         "@npm//@aws-cdk/aws-certificatemanager",
#         "@npm//@aws-cdk/aws-iam",
#         "@npm//form-data",
#         "@npm//aws-sdk"
#     ],
# )

# jest_test(
#     name = "test",
#     deps = [
#         ":test_library",
#     ],
# )

cdkx_package(
    name = "web-application",
    readme_md = "README.md",
    deps = [
        ":library"
    ]
)