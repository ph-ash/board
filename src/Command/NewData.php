<?php

declare(strict_types=1);

namespace App\Command;

use Exception;
use Psr\Log\NullLogger;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Exception\InvalidArgumentException;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Thruway\ClientSession;
use Thruway\Connection;
use Thruway\Logging\Logger;

class NewData extends ContainerAwareCommand
{
    /**
     * @throws InvalidArgumentException
     */
    protected function configure()
    {
        $this->setName('test:newdata');
    }

    /**
     * @throws Exception
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $thruwayConfiguration = $this->getContainer()->getParameter('voryx_thruway');

        Logger::set(new NullLogger());

        $connection = new Connection(
            [
                'realm' => $thruwayConfiguration['realm'],
                'url' => $thruwayConfiguration['trusted_url'],
            ]
        );

        $connection->on(
            'open',
            function (ClientSession $session) use ($connection) {
                $session->publish('foo', ['Hello, world from PHP!']);

                $connection->close();
            }
        );

        $connection->open();
    }
}
