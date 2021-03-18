FROM google/dart

RUN echo "Bundeling code from directory $PWD"

# Copy code to temp dir
ADD $PWD/handlers /tmp/code

WORKDIR /tmp/code

# Install required modules
RUN pub get

# Create bootstrap executable
RUN dart2native  main.dart -o bootstrap

RUN mkdir /asset && mv bootstrap /asset

WORKDIR /asset

# Disasble any default cmd and entrypoints