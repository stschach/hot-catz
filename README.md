# hot-catz

HotCatz is a web app challenge developed as a learning experience, to teach myself the basics of web development. I pursued Javascript, the Ember framework, and a light back-end with [Firebase](https://firebase.google.com/).
This is a simple app that prompts users to vote on whichever cat suits their fancy, shown in the matchup box. The app also allows users to upload and name their own cats, and give others the chance to vote on them. A leaderboard of current results is shown at the bottom.

* [Endpoint](http://hot-catz-stschach.s3-website-us-east-1.amazonaws.com)

###Resources

* Every addon's README.md
* [Emberjs API](https://emberjs.com/api/ember/release)
* [Emberjs Guides + super-rentals](https://guides.emberjs.com/v3.0.0/tutorial/ember-cli/)
* [Scott Batson's Ember Tutorials](https://www.youtube.com/channel/UCEsbvhY08o6RbuDHVwfbhnw/videos)
* [EmberSchool](https://www.emberschool.com/) for most of my Ember learning - my favorite Ember resource
* [Codecademy: Intro to JS](https://www.codecademy.com/learn/introduction-to-javascript) for syntax
* [Eloquent Javascript](http://eloquentjavascript.net/) in pursuit of a deeper understanding
* [Firebase Documentation](https://firebase.google.com/docs/storage/web/upload-files) for uploading
* [HTML & CSS](https://www.w3schools.com/)
* [Ember Igniter Deploy to S3](https://emberigniter.com/deploy-ember-cli-app-amazon-s3-linux-ssh-rsync/)
* [AWS Docs](https://aws.amazon.com/documentation/)
* Everything else, and most questions, were found answered in some way on [stackoverflow](https://stackoverflow.com/)


## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd hot-catz`
* `npm install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

This app is ready to deploy to an s3 bucket with [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html).

* Create an S3 bucket with the [S3 Console](https://s3.console.aws.amazon.com)
* Create users and set permissions. Everything can be found in AWS documentation. Here's a [walkthrough](https://docs.aws.amazon.com/AmazonS3/latest/dev/walkthrough1.html)
* Set your bucket's permissions. Example bucket policy:

```js
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddCannedAcl",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::111122223333:user/hot-catz-generic-user-group",
                    "arn:aws:iam::444455556666:user/hot-catz-admin-user-group"
                ]
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::hot-catz-stschach/*"
        }
    ]
}
```

* Modify /config/deploy.js to:

```javascript
/*...*/

's3-index': {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"],
    bucket: "your-bucket-name",
    region: "us-east-1", // may need to change region
    allowOverwrite: true
},
's3': {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"],
    bucket: "your-bucket-name",
    region: "us-east-1" // may need to change region
}

/*...*/
```

* After setting user permissions, setup environmental variables with `aws configure`
* Deploy with `ember deploy production --verbose --activate=true`
* Check your endpoint!

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
