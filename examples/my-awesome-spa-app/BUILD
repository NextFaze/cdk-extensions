load("//:tools/defaults.bzl", "setup_ts_build")

package(default_visibility = ["//visibility:public"])

setup_ts_build(
    name = "library",
    deps = [
        "//packages/web-application:library",
        "//packages/aws-sns-subscriptions:library",
        "@npm//@aws-cdk/aws-apigateway",
        "@npm//@aws-cdk/aws-sns",
        "@npm//@aws-cdk/aws-route53",
        "@npm//@aws-cdk/aws-certificatemanager"
    ],
)