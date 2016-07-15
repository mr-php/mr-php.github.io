---
layout: post
title: Populate Select2 from Another Select2
excerpt: "<p>Update the data in a select2 widget when another select2 widget changes.</p>"
tags: [yii]
---

Update the data in a select2 widget when another select2 widget changes.

## Requirements

requires `kartik-v/yii2-widget-select2`:

```
require kartik-v/yii2-widget-select2 "@dev"
```

## Database and Models

```sql
CREATE TABLE `client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `client_code` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `client_code_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`)
);
CREATE TABLE `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `client_code_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `client_code_id` (`client_code_id`),
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`client_code_id`) REFERENCES `client_code` (`id`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`)
);
```

`models/Client.php`

```php
<?php
namespace app\models;
class Client extends \yii\db\ActiveRecord
{
}
```

`models/ClientCode.php`

```php
<?php
namespace app\models;
class ClientCode extends \yii\db\ActiveRecord
{
}
```

`models/Order.php`

```php
<?php
namespace app\models;
class Order extends \yii\db\ActiveRecord
{
    public function rules()
    {
        return [
            [['client_id', 'client_code_id'], 'required'],
        ];
    }
}
```

## Controllers and Views

The `OrderController` will be used to load a form to create and update orders.  Each order will have a `client_id` and a `client_code_id`.

`controllers/OrderController.php`

```php
<?php
namespace app\controllers;

use app\models\Order;
use Yii;
use yii\web\Controller;
use yii\web\HttpException;

class OrderController extends Controller
{
    public function actionCreate()
    {
        $model = new Order;
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            Yii::$app->getSession()->setFlash('success', 'Order has been created.');
            return $this->redirect(['update', 'id' => $model->id]);
        } elseif (!Yii::$app->request->isPost) {
            $model->load(Yii::$app->request->get());
        }

        return $this->render('create', ['model' => $model]);
    }

    public function actionUpdate($id)
    {
        $model = $this->findModel($id);
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            Yii::$app->getSession()->setFlash('success', 'Order has been updated.');
            return $this->redirect(['update', 'id' => $model->id]);
        } elseif (!Yii::$app->request->isPost) {
            $model->load(Yii::$app->request->get());
        }

        return $this->render('update', ['model' => $model]);
    }

    protected function findModel($id)
    {
        if (($model = Order::findOne($id)) !== null) {
            return $model;
        }
        throw new HttpException(404, 'The requested page does not exist.');
    }
}
```

The `ClientController` will have an action that is called via ajax that will be used to populate the `client_code_id` field whenever the `client_id` field is changed.

`controllers\ClientController.php`

```php
<?php
namespace app\controllers;

use app\models\ClientCode;
use Yii;
use yii\web\Controller;
use yii\web\Response;

class ClientController extends Controller
{
    public function actionPopulateClientCode($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $clientCodes = ClientCode::find()->andWhere(['client_id' => $id])->all();
        $data = [['id' => '', 'text' => '']];
        foreach ($clientCodes as $clientCode) {
            $data[] = ['id' => $clientCode->id, 'text' => $clientCode->code];
        }
        return ['data' => $data];
    }
}
```

The views `views/order/create.php` and `views/order/update.php` will both render a form.

```php
<?= $this->render('_form', ['model' => $model]); ?>
```

The order form will display 2 select2 fields, one for `client_id` and another for `client_code_id`.  When `client_id` is changed it triggers the javascript function `populateClientCode()` which will perform an ajax request to `/client/populate-client-code`, and place the returned data into the select2 for `client_code_id`.

`views/order/_form.php`

```php
<?php
use app\models\Client;
use app\models\ClientCode;
use kartik\select2\Select2;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\helpers\Url;
use yii\web\View;
use yii\widgets\ActiveForm;

$select2Options = [
    'multiple' => false,
    'theme' => 'krajee',
    'placeholder' => 'Type to autocomplete',
    'language' => 'en-US',
    'width' => '100%',
];
?>
<div class="product-form">

    <?php $form = ActiveForm::begin(); ?>

    <?= $form->errorSummary($model); ?>

    <fieldset>
        <legend>Client</legend>
        
        <?= $form->field($model, 'client_id')->widget(Select2::className(), [
            'model' => $model,
            'attribute' => 'client_id',
            'data' => ArrayHelper::map(Client::find()->all(), 'id', 'name'),
            'options' => $select2Options,
            'pluginEvents' => [
                'select2:select' => 'function(e) { populateClientCode(e.params.data.id); }',
            ],
        ]); ?>

        <?= $form->field($model, 'client_code_id')->widget(Select2::className(), [
            'model' => $model,
            'attribute' => 'client_code_id',
            'data' => ArrayHelper::map(ClientCode::find()->andWhere(['client_id' => $model->id])->all(), 'id', 'code'),
            'options' => $select2Options,
        ]); ?>

        <?php ob_start(); // output buffer the javascript to register later ?>
        <script>
            function populateClientCode(client_id) {
                var url = '<?= Url::to(['client/populate-client-code', 'id' => '-id-']) ?>';
                var $select = $('#order-client_code_id');
                $select.find('option').remove().end();
                $.ajax({
                    url: url.replace('-id-', client_id),
                    success: function (data) {
                        var select2Options = <?= Json::encode($select2Options) ?>;
                        select2Options.data = data.data;
                        $select.select2(select2Options);
                        $select.val(data.selected).trigger('change');
                    }
                });
            }
        </script>
        <?php $this->registerJs(str_replace(['<script>', '</script>'], '', ob_get_clean()), View::POS_END); ?>

    </fieldset>

    <?= Html::submitButton('Save'); ?>
    <?php ActiveForm::end(); ?>

</div>
```
