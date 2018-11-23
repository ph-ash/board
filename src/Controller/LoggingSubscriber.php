<?php

declare(strict_types=1);

namespace App\Controller;

use Voryx\ThruwayBundle\Annotation\Subscribe;

class LoggingSubscriber
{
    /**
     * @Subscribe(value="phashtopic", worker="LOGGING_SUBSCRIBER")
     */
    public function subscribe()
    {
        $now = date("Y-m-d\TH:i:s") . substr((string)microtime(), 1, 8);
        echo sprintf("%s %s\n", $now, json_decode(func_get_args()[0], true)['id']);
    }
}
