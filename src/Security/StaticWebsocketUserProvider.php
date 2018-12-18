<?php

declare(strict_types=1);

namespace App\Security;

use Symfony\Component\Security\Core\User\InMemoryUserProvider;

class StaticWebsocketUserProvider extends InMemoryUserProvider
{
    public function __construct(string $userPassword)
    {
        parent::__construct([
            'phash-board' => [
                'password' => $userPassword,
                'roles' => [
                    'ROLE_USER'
                ]
            ]
        ]);
    }
}
