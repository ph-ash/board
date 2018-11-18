<?php

declare(strict_types=1);

namespace App\Command;

use DateTimeImmutable;
use Exception;
use Psr\Log\NullLogger;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Exception\InvalidArgumentException;
use Symfony\Component\Console\Input\InputArgument;
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
        $this->setName('test:newdata')
            ->addArgument('status', InputArgument::OPTIONAL)
            ->addArgument('count', InputArgument::OPTIONAL, '', 25);
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
            function (ClientSession $session) use ($connection, $input) {
                for ($i = 0; $i < $input->getArgument('count'); $i++) {
                    $payload = [
                        'id' => 'example monitoring ' . ($i + 1),
                        'status' => $input->getArgument('status'),
                        'payload' => 'payload',
                        'idleTimeout' => '100',
                        'date' => (new DateTimeImmutable())->format(DateTimeImmutable::ATOM)
                    ];

                    $session->publish('phashtopic', [json_encode($payload)]);
                }

                $connection->close();
            }
        );

        $connection->open();
    }
}
