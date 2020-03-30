# WeChat-miniprogram-RichNode

#### Markdown文本转微信小程序rich-text组件nodes数据

* 支持

  + 标题 #

    ```markdown
    # 一号标题
    ## 二号标题
    ```

  + 列表

    ```markdown
    + 类型1
    - 类型2
    * 类型3
    1. 有序标题
    ```

  + 图片

    ```markdown
    ![alt](url)
    ```

  + 代码区块

    ```markdown
    ​```java
     int a=0; //注释
    ```

  + 分割线

    ```markdown
    ---
    ***
    ___
    ```

  + 链接

    ```markdown
    [文字](url)
    <url>
    ```

    

  + 行内元素

    + 粗体、斜体、粗斜体、删除

      ```markdown
      **粗体** __粗体__
      *斜体*  _斜体_
      ***粗斜体*** ___粗斜体___
      ~~删除~~
      ```

    + 代码片段

      ```markdown
      `int a=0;`
      ```

* 不支持（或现不支持，以后会支持）

  + =标记的一级标题和-标记的二级标题

    ```markdown
    标题1
    ========
    标题2
    --------
    ```

  + 表格

  + 脚注

  + 链接点击（由于rich-text的局限性）

  + 图片查看（由于rich-text的局限性）