<?php

declare(strict_types=1);

namespace App\Controller;

use Voryx\ThruwayBundle\Annotation\Subscribe;

class Wamp
{
    /**
     * @Subscribe(value="foo", worker="FOO_SUB")
     */
    public function subscribe()
    {
        var_dump(func_get_args());
    }
}
