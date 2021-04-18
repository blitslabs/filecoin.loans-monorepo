# C++ bindings

Currently, we don't provide compiled artifacts, therefore, manual steps to build and orchestrate the libraries and headers are necessary.

# Running 

Assuming that the header and library are in the same directory.

```bash
g++ main.cpp -L. -lfilecoin_signer_ffi -o main
LD_LIBRARY_PATH=. ./main
```
