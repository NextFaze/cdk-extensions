load("@build_bazel_rules_nodejs//:index.bzl", "pkg_npm")

def cdkx_package(name, readme_md, data = [], deps = [], **kwargs):
    """ Creates Publishable npm package with additional artifacts bundled together        
    """

    native.genrule(
        name = "license_copied",
        srcs = ["//:LICENSE"],
        outs = ["LICENSE"],
        cmd = "cp $< $@",
    )

    pkg_npm(
        name = name,
        srcs = [readme_md, "package.json"] + data ,
        replace_with_version = "0.0.0-PLACEHOLDER",
        substitutions = {
            "0.0.0-AWS_CDK_PEER_VERSION": "{AWS_CDK_PEER_VERSION}",
        },
        deps = [
            ":license_copied",
        ] + deps,
    )