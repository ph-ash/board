<?php

declare(strict_types=1);

namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class Index extends AbstractController
{
    /**
     * @Route("/")
     * @IsGranted("ROLE_USER")
     * @throws \LogicException
     */
    public function index(): Response
    {
        return $this->render('base.html.twig');
    }
}
