```mermaid
graph TD
    A["Input Layer\\n(1, 60, 151, 1)"] --> B["Conv2D\\n(8 filters, 1x32 kernel)\\noutput: 1, 60, 151, 8"]
    B --> C["DepthwiseConv2D\\n(16 filters, 60x1 kernel)\\noutput: 1, 1, 151, 16"]
    C --> D["AveragePooling2D\\n(1x4 pooling)\\noutput: 1, 1, 37, 16"]
    D --> E["SeparableConv2D\\n(16 filters, 1x16 kernel)\\noutput: 1, 1, 22, 16"]
    E --> F["AveragePooling2D\\n(1x8 pooling)\\noutput: 1, 1, 2, 16"]
    F --> G["Flatten"]
    G --> H["Dense Layer\\n(4 units)\\noutput: 4"]
    H --> I["Softmax Activation"]
