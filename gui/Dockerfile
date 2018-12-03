FROM node:8.2.1-slim

# To install sysconfcpus (otherwise elm make takes forever on Docker), as per https://github.com/elm-lang/elm-compiler/issues/1473#issuecomment-245704142

RUN apt-get update && apt-get install -y --no-install-recommends \
    git gcc binutils libc6-dev autoconf automake perl file \
 && apt-get install -y make \
 && git clone https://github.com/obmarg/libsysconfcpus.git \
 && cd libsysconfcpus \
 && ./configure --prefix=/sysconfcpus \
 && make \
 && make install \
 && apt-get remove --purge -y git gcc binutils libc6-dev autoconf automake perl file \
 && apt-get autoremove -y

# Otherwise you get Error extracting linux-x64.tar.gz - Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/elm/Elm-Platform'
# Need that exact version of elm-test otherwise it hangs indefinitely on Docker (as per https://github.com/rtfeldman/node-test-runner/issues/219#issuecomment-345037285)
RUN npm config set unsafe-perm=true && npm install -g elm@0.18.0 elm-test@0.18.12 elm-verify-examples inliner

ENTRYPOINT /sysconfcpus/bin/sysconfcpus -n 2 elm-make --yes --warn src/Main.elm --output src/js/elm.js
