## Instance Refresh bug reproduction

### The problem
In the pulumi AWS Auto Scaling Group input, 
there is option to configure triggering Instance Refresh after events like launch template update etc.

The [documentation](https://www.pulumi.com/docs/reference/pkg/aws/autoscaling/group/#instancerefresh_nodejs) says that if the `instanceRefresh` block is configured then pulumi will start the Instance Refresh.
However, I am not observing this behaviour after updating the lunch template, and I need to trigger it from console manually.

### How to reproduce it
1. Clone this repository
2. Run `npm install`
3. Make sure you have configured credentials for you AWS Account
4. Run `pulumi up`
5. Find the instance ip in the AWS EC2 console and open it in the browser. You should see a page with `Hello World` text.
6. Update the value of `pageContent` variable from `index.ts` file
7. Run `pulumi up` (Pulumi should update the LaunchTemplate)
8. Open AWS ASG console, there is no instance refresh running!

### Expected behaviour
After running the `7` step, the pulumi should trigger the instance refresh procedure (which is available in the SDK),
and the new instance should be created hosting page with updated content.
