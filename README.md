# s3rsync

**s3rsync** is a simple tool that keeps in sync local files with a bucket on AWS S3 and vice versa.

## Goal and Features

The main goals of **s3rsync** are:

1. Simple to use CLI tool
2. Minimizing outbound traffic to S3, reducing outbound bandwidth usage.
3. Minimizing inbound traffic from S3, thus reducing the cost charged by AWS.


**s3rsync** has a basic set of features which keeps the tools simple, lean and easy to use:

- Sync a local file to a remote S3 object
- Sync a remote S3 object to a local file
- Only transfer minimal part of a file (chunks) to reduce bandwidth and AWS cost
- Easy to use CLI interface


## Install

The installation is extremely simple via npm (I have only teste don Linux and MacOS).

```bash
npm install -g s3rsync
```

## Configuration

**s3rsync** in order to operate requires AWS credentials and region configuration

```bash 
mkdir ~/.aws

cat << EOF >> ~/.aws/credentials
[default]
aws_access_key_id = <YOUR AWS ACCESS KEY ID>
aws_secret_access_key = <YOUR AWS ACCESS KEY SECRET> 
EOF

cat << EOF >> ~/.aws/config
[default]
region = <YOUR S3 BUCKET REGION>
output = json
EOF
```

## Usage

```bash
Usage: s3rsync [options] [command]

Options:
  -v, --version                          output the current version
  -h, --help                             display help for command

Commands:
  sync [options] <source> <destination>  smart sync of file:// | s3:// source to file:// | s3:// destination
  help [command]                         display help for command

```

### Sync a local file to remote S3 object

```bash
s3rsync sync -cs 1048576 file://my_local_file s3://my-bucket 
```

This command will synchronize the local file *my_local_file* with the remote bucket *my-bucket*

The first time all the file content will be uploaded to the S3 bucket as a series of chunks of 1MB size (*-cs option*)

For each subsequent synchronization operation only the modified chunks (if any) will be uploaded.

### Sync a remote S3 object to a local file


Descrivi come usare il tuo tool e fornisce esempi pratici.

```bash
s3rsync sync s3://my-bucket file://my_local_file  
```

This command will synchronize a remote S3 object present in the bucket *my-bucket* to a local file named *my_local_file*.

If the local file is not present, then all the chunks will be downloaded.

For each subsequent synchronization operation only the modified chunks (if any) will be downloaded.

Please  note that the *-cs* option is not required in such scenario as the tool will figure it out by itself.

## CHANGELOG

See the file [CHANGELOG.md](https://github.com/profmancusoa/s3rsync/blob/main/CHANGELOG.md)

## Contributions

In case you want to contribute just

1. open an issue describing the planned contribution
2. fork the repo
3. issue a PR

## Bugs

In case of bugs please open an issue on github

## License

GPL-3.0-or-later
