# npmfill
Extend the installation systax of the npm.

## Usage

Firstly, install `npmfill`:

```shell
npm i npmfill -g
```

Then, configure the git source in the `.npmrc` file (project or user):

```ini
[npmfill]
my = git+ssh://myusername@git.mydomain.com:{user}{repositry}.git{version}
```

Lastly, run the `nf` command to install some package:

```shell
nf install my:alex/hello-world@0.4.2
nf install my:alex/hello-world
nf i my:alex/hello-world
nf i my:alex/hello-world --save
```

Actually, all the work of the npmfill is to transform the specified package syntax to an git url. If it can be transformed, the command line arguments  are passed to npm intact.

## Todos

- Add tests
- Improve the document
- Support multiple packages
- Exit code, stdout and stderr

## License

MIT
