---
layout: post
title: Advanced Multi-Model Forms in Yii2
excerpt: "<p>Manage multiple models in a form, supporting validation for each model.</p>"
tags: [yii2, forms]
---

How to manage multiple models in a form, supporting validation for each model.

After submitting the form, any validation errors will be clearly displayed.

![Yii2 Multi-Model Form](https://cloud.githubusercontent.com/assets/51875/16708229/58cdacfc-462a-11e6-96dc-3894f6e1cf6b.jpg)


Consider a `Product` model that has a single `Parcel` model related, which represents a
parcel that belongs to the product.  In the form you want to enter information for the 
product and the parcel at the same time, and each one should validate according to the model rules.

## Table Models

Start with the following tables:

```sql
CREATE TABLE `product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
CREATE TABLE `parcel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `height` int(11) NOT NULL,
  `width` int(11) NOT NULL,
  `depth` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `parcel_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB;
```

And the models that represent the tables are:

`models/Product.php`

```php
<?php
namespace app\models;
use \yii\db\ActiveRecord;

class Product extends ActiveRecord
{
    public static function tableName()
    {
        return 'product';
    }
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['name'], 'string', 'max' => 255]
        ];
    }
    public function getParcel()
    {
        return $this->hasOne(Parcel::className(), ['product_id' => 'id']);
    }
}

```

`models/Parcel.php`

```php
<?php
namespace app\models;
use \yii\db\ActiveRecord;

class Parcel extends ActiveRecord
{
    public static function tableName()
    {
        return 'parcel';
    }
    public function rules()
    {
        return [
            [['code', 'height', 'width', 'depth'], 'required'],
            [['product_id', 'height', 'width', 'depth'], 'integer'],
            [['code'], 'string', 'max' => 255],
            [['product_id'], 'exist', 
              'skipOnError' => true, 
              'targetClass' => Product::className(), 
              'targetAttribute' => ['product_id' => 'id']]
        ];
    }
    public function getProduct()
    {
        return $this->hasOne(Product::className(), ['id' => 'product_id']);
    }
}
```

## The Form Model

Now we get to the advanced form, but don't worry, it's all quite straight forward.  We need a model to handle loading, validating and saving the data.  

The purpose of `ProductForm` form is to:
- handle loading `Product` and `Parcel` models
- assigning the submitted data to model attributes
- saving data after validation
- displaying error summaries on the form

`models/form/ProductForm`

```php
<?php
namespace app\models\form;

use app\models\Product;
use app\models\Parcel;
use Yii;
use yii\base\Model;
use yii\widgets\ActiveForm;

class ProductForm extends Model
{
    private $_product;
    private $_parcel;

    public function rules()
    {
        return [
            [['Product'], 'required'],
            [['Parcel'], 'safe'],
        ];
    }

    public function afterValidate()
    {
        $error = false;
        if (!$this->product->validate()) {
            $error = true;
        }
        if (!$this->parcel->validate()) {
            $error = true;
        }
        if ($error) {
            $this->addError(null); // add an empty error to prevent saving
        }
        parent::afterValidate();
    }

    public function save()
    {
        if (!$this->validate()) {
            return false;
        }
        $transaction = Yii::$app->db->beginTransaction();
        if (!$this->product->save()) {
            $transaction->rollBack();
            return false;
        }
        $this->parcel->product_id = $this->product->id;
        if (!$this->parcel->save(false)) {
            $transaction->rollBack();
            return false;
        }
        $transaction->commit();
        return true;
    }

    public function getProduct()
    {
        return $this->_product;
    }

    public function setProduct($product)
    {
        if ($product instanceof Product) {
            $this->_product = $product;
        } else if (is_array($product)) {
            $this->_product->setAttributes($product);
        }
    }

    public function getParcel()
    {
        if ($this->_parcel === null) {
            if (!$this->product->isNewRecord) {
                $this->_parcel = $product->parcel;
            }
        }
        return $this->_parcel;
    }

    public function setParcel($parcel)
    {
        if (is_array($parcel)) {
            $this->parcel->setAttributes($parcel);
        } elseif ($parcel instanceof Parcel) {
            $this->_parcel = $parcel;
        }
    }

    public function errorSummary($form)
    {
        $errorLists = [];
        foreach ($this->getAllModels() as $id => $model) {
            $errorList = $form->errorSummary($model, [
              'header' => '<p>Please fix the following errors for <b>' . $id . '</b></p>',
            ]);
            $errorList = str_replace('<li></li>', '', $errorList); // remove the empty error
            $errorLists[] = $errorList;
        }
        return implode('', $errorLists);
    }

    private function getAllModels()
    {
        return [
            'Product' => $this->product,
            'Parcel' => $this->parcel,
        ];
    }

}
```

## Controller Actions

The `ProductForm` class is used in `actionUpdate()` and `actionCreate()` methods in `ProductController`.

`controllers/ProductController.php`

```php
<?php
namespace app\controllers;
use app\models\Product;
use Yii;
use yii\web\Controller;

class ProductController extends Controller
{
    public function actionCreate()
    {
        $productForm = new ProductForm();
        $productForm->product = new Product;
        $productForm->setAttributes(Yii::$app->request->post());
        if (Yii::$app->request->post() && $productForm->save()) {
            Yii::$app->getSession()->setFlash('success', 'Product has been created.');
            return $this->redirect(['update', 'id' => $productForm->product->id]);
        } elseif (!Yii::$app->request->isPost) {
            $productForm->load(Yii::$app->request->get());
        }
        return $this->render('create', ['productForm' => $productForm]);
    }
    public function actionUpdate($id)
    {
        $productForm = new ProductForm();
        $productForm->product = $this->findModel($id);
        $productForm->setAttributes(Yii::$app->request->post());
        if (Yii::$app->request->post() && $productForm->save()) {
            Yii::$app->getSession()->setFlash('success', 'Product has been updated.');
            return $this->redirect(['update', 'id' => $productForm->product->id]);
        } elseif (!Yii::$app->request->isPost) {
            $productForm->load(Yii::$app->request->get());
        }
        return $this->render('update', ['productForm' => $productForm]);
    }
    protected function findModel($id)
    {
        if (($model = Product::findOne($id)) !== null) {
            return $model;
        }
        throw new HttpException(404, 'The requested page does not exist.');
    }
}
```

## Form Views

The views `views/product/create.php` and `views/product/update.php` will both render a form.

```php
<?= $this->render('_form', ['productForm' => $productForm]); ?>
```

The form will have a section for the Product, and another section for the Parcels.  

After saving, each Product and Parcel field will be validated individually, if any fail the error will be displayed at the top as well as on the errored field.

`views/product/_form.php`

```php
<?php
use app\models\Parcel;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

?>
<div class="product-form">

    <?php $form = ActiveForm::begin([
        'enableClientValidation' => false, // TODO get this working with client validation
    ]); ?>

    <?= $productForm->errorSummary($form); ?>

    <fieldset>
        <legend>Product</legend>
        <?= $form->field($productForm->product, 'name')->textInput() ?>
    </fieldset>

    <fieldset>
        <legend>Parcel</legend>
        <?php
        <?= $form->field($productForm->product, 'code')->textInput() ?>
        <?= $form->field($productForm->product, 'width')->textInput() ?>
        <?= $form->field($productForm->product, 'height')->textInput() ?>
        <?= $form->field($productForm->product, 'depth')->textInput() ?>
    </fieldset>

    <?= Html::submitButton('Save'); ?>
    <?php ActiveForm::end(); ?>

</div>
```

## Additional Information

The `$_POST` data will look something like the following:

```
$_POST = [
    'Product' => [
        'name' => 'Keyboard and Mouse',
    ],
    'Parcel' => [
        'code' => 'keyboard',
        'width' => '50',
        'height' => '5',
        'depth' => '20',
    ],
];
```
