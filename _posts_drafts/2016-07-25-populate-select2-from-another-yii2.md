# Populate Select2 from Another Select2

## Requirements

requires `kartik-v/yii2-widget-select2`:

```
require kartik-v/yii2-widget-select2 "@dev"
```

## Controller

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
        $clientCodes = ClientCode::find()->andWhere(['id' => $id])->all();
        $results = [['id' => '', 'text' => '']];
        foreach ($clientCodes as $clientCode) {
            $results[] = ['id' => $clientCode->id, 'text' => $clientCode->code];
        }
        return ['results' => $results];
    }
}
```

`_form.php`

```php
        <?= $form->field($model, 'client_id')->widget(Select2::classname(), [
            'model' => $model,
            'attribute' => 'client_id',
            'data' => ArrayHelper::map(Client::find()->all(), 'client_id', 'label'),
            'options' => [
                'placeholder' => 'Type to autocomplete',
                'multiple' => false,
            ],
            'pluginEvents' => [
                'select2:select' => 'function(e) { populateClientCode(e.params.data.id); }',
            ],
        ]); ?>

        <?= $form->field($model, 'client_code_id')->widget(Select2::classname(), [
            'model' => $model,
            'attribute' => 'client_code_id',
            'data' => ArrayHelper::map(ClientCode::find()->andWhere(['client_id' => $model->client_id])->all(), 'client_code_id', 'label'),
            'options' => [
                'placeholder' => 'Type to autocomplete',
                'multiple' => false,
            ]
        ]); ?>

        <?php ob_start(); // output buffer the javascript to register later ?>
        <script>
            function populateClientCode(client_id) {
                var url = '<?= Url::to(['client/populate-client-code', 'id' => '-id-']) ?>';
                $('#job-client_code_id').find('option').remove().end();
                $.ajax({
                    url: url.replace('-id-', client_id),
                    success: function (data) {
                        $('#job-client_code_id').select2({
                            theme: 'krajee',
                            placeholder: 'Type to autocomplete',
                            language: 'en',
                            data: data.results
                        });
                    }
                });
            }
        </script>
        <?php $this->registerJs(str_replace(['<script>', '</script>'], '', ob_get_clean()), View::POS_END); ?>
```
