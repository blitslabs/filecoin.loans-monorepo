# Java bindings

Currently, we don't provide compiled artifacts, therefore, manual steps to build and orchestrate the libraries and headers are necessary.

# Running 

Assuming that the library, the header and the package are in the same directory.

```bash
javac -cp . Main.java
java -Djava.library.path="." -ea Main
```
