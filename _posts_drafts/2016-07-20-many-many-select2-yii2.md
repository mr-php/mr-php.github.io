---
layout: post
title: Many to Many Select2 Widget in Yii2
excerpt: "<p>Select multiple related records and add new related records using Select2.</p>"
tags: [yii]
---

Select multiple related records and add new related records using Select2.

![Many to Many Select2 Widget](https://cloud.githubusercontent.com/assets/51875/16871072/e115285e-4ac3-11e6-8270-8eb4a506ffdd.png)

## Requirements

requires `cornernote/yii2-linkall` and `kartik-v/yii2-widget-select2`:

```
composer require cornernote/yii2-linkall "*"
require kartik-v/yii2-widget-select2 "@dev"
```

## Database and Models

```sql
CREATE TABLE `post` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `post_to_tag` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `post_to_tag_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`),
  CONSTRAINT `post_to_tag_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
);
```

`app/models/Post.php`

```php
<?php
namespace app\models;

use cornernote\linkall\LinkAllBehavior;
use yii\db\ActiveRecord;

class Post extends ActiveRecord
{
    public $tag_ids;

    public function rules()
    {
        return [
            [['title', 'body', 'tag_ids'], 'required'],
        ];
    }

    public function behaviors()
    {
        return [
            LinkAllBehavior::className(),
        ];
    }

    public function afterSave($insert, $changedAttributes)
    {
        $tags = [];
        foreach ($this->tag_ids as $tag_name) {
            $tag = Tag::getTagByName($tag_name);
            if ($tag) {
                $tags[] = $tag;
            }
        }
        $this->linkAll('tags', $tags);
        parent::afterSave($insert, $changedAttributes);
    }

    public function getTags()
    {
        return $this->hasMany(Tag::className(), ['id' => 'tag_id'])
            //->via('postToTag');
            ->viaTable('post_to_tag', ['post_id' => 'id']);
    }
}
```

`app/models/Tag.php`

```php
<?php
namespace app\models;

use yii\db\ActiveRecord;

class Tag extends ActiveRecord
{
    public static function getTagByName($name)
    {
        $tag = Tag::find()->where(['name' => $name])->one();
        if (!$tag) {
            $tag = new Tag();
            $tag->name = $name;
            $tag->save(false);
        }
        return $tag;
    }
}
```

## Controller and  Views

`app/controllers/PostController.php`

```php
<?php
namespace app\controllers;

use app\models\Post;
use Yii;
use yii\helpers\ArrayHelper;
use yii\web\Controller;
use yii\web\HttpException;

class PostController extends Controller
{
    public function actionCreate()
    {
        $model = new Post;
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            Yii::$app->getSession()->setFlash('success', Yii::t('app', 'Post has been updated.'));
            return $this->redirect(['update', 'id' => $model->id]);
        } elseif (!\Yii::$app->request->isPost) {
            $model->load(Yii::$app->request->get());
            $model->tag_ids = ArrayHelper::map($model->tags, 'name', 'name');
        }

        return $this->render('create', ['model' => $model]);
    }

    public function actionUpdate($id)
    {
        $model = $this->findModel($id);
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            Yii::$app->getSession()->setFlash('success', Yii::t('app', 'Post has been updated.'));
            return $this->redirect(['update', 'id' => $model->id]);
        } elseif (!\Yii::$app->request->isPost) {
            $model->load(Yii::$app->request->get());
            $model->tag_ids = ArrayHelper::map($model->tags, 'name', 'name');
        }

        return $this->render('update', ['model' => $model]);
    }

    protected function findModel($id)
    {
        if (($model = Post::findOne($id)) !== null) {
            return $model;
        }
        throw new HttpException(404, 'The requested page does not exist.');
    }
}
```

The views `views/post/create.php` and `views/post/update.php` will both render a form.

```
<?= $this->render('_form', ['productForm' => $productForm]); ?>
```

`views/post/_form.php`

```php
<?php
use app\models\Tag;
use kartik\select2\Select2;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

?>
<div class="product-form">

    <?php $form = ActiveForm::begin(); ?>

    <?= $form->errorSummary($model); ?>

    <fieldset>
        <legend>Post</legend>
        <?= $form->field($model, 'title')->textInput() ?>
        <?= $form->field($model, 'body')->textarea() ?>
    </fieldset>

    <fieldset>
        <legend>Tags</legend>
        <?= $form->field($model, 'tag_ids')->widget(Select2::className(), [
            'model' => $model,
            'attribute' => 'tag_ids',
            'data' => ArrayHelper::map(Tag::find()->all(), 'name', 'name'),
            'options' => [
                'multiple' => true,
            ],
            'pluginOptions' => [
                'tags' => true,
            ],
        ]); ?>
    </fieldset>

    <?= Html::submitButton('Save'); ?>
    <?php ActiveForm::end(); ?>

</div>
```
