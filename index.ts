import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const size = "t2.micro";
const ami = pulumi.output(aws.getAmi({
    filters: [{
        name: "name",
        values: ["amzn-ami-hvm-*"],
    }],
    owners: ["137112412989"],
    mostRecent: true,
}));

const group = new aws.ec2.SecurityGroup("pulumi-bug-reproduction-sg", {
    ingress: [
        {protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"]},
        {protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"]},
    ],
});

const pageContent = 'Hello, World!' //<--- CHANGE STH HERE

const userData =
    `#!/bin/bash
echo "${pageContent}" > index.html
nohup python -m SimpleHTTPServer 80 &`;

const launchTemplate = new aws.ec2.LaunchTemplate("pulumi-bug-reproduction-template", {
    imageId: ami.id,
    instanceType: size,
    userData: Buffer.from(userData).toString('base64'),
    vpcSecurityGroupIds: [group.id],
    tagSpecifications: [{
        resourceType: 'instance',
        tags: {
            "Name": "Bug reproduction",
        },
    }],
    tags: {
        "Name": "Bug reproduction",
    },
})

const autoscalingGroup = new aws.autoscaling.Group('pulumi-bug-reproduction-asg', {
    availabilityZones: ['eu-central-1b'],
    desiredCapacity: 1,
    maxSize: 1,
    minSize: 1,
    healthCheckType: 'EC2',
    healthCheckGracePeriod: 30,
    instanceRefresh: {
        strategy: 'Rolling',
        preferences: {
            instanceWarmup: '30',
            minHealthyPercentage: 0,
        },
    },
    launchTemplate: {
        id: launchTemplate.id,
        version: '$Latest',
    },
})
