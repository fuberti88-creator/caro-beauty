/* =========================================
   CARÔ BEAUTY
   CATÁLOGO MOBILE
========================================= */


const CHAVE_PRODUTOS =
    "caroBeautyProdutos";


let carrinho = [];

let categoriaAtual = "Todos";

let produtos = [];



/* =========================================
   ELEMENTOS
========================================= */

const gradeProdutos =
    document.getElementById(
        "gradeProdutos"
    );


const semProdutos =
    document.getElementById(
        "semProdutos"
    );


const campoBusca =
    document.getElementById(
        "campoBusca"
    );


const filtroAtual =
    document.getElementById(
        "filtroAtual"
    );


const abrirCarrinho =
    document.getElementById(
        "abrirCarrinho"
    );


const fecharCarrinho =
    document.getElementById(
        "fecharCarrinho"
    );


const carrinhoElemento =
    document.getElementById(
        "carrinho"
    );


const fundoCarrinho =
    document.getElementById(
        "fundoCarrinho"
    );


const listaCarrinho =
    document.getElementById(
        "listaCarrinho"
    );


const quantidadeCarrinho =
    document.getElementById(
        "quantidadeCarrinho"
    );


const totalCarrinho =
    document.getElementById(
        "totalCarrinho"
    );


const verProdutos =
    document.getElementById(
        "verProdutos"
    );



/* =========================================
   INICIAR
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarProdutos();

        mostrarProdutos();

        atualizarCarrinho();

    }
);



/* =========================================
   CARREGAR PRODUTOS
========================================= */

function carregarProdutos() {

    const produtosSalvos =
        localStorage.getItem(
            CHAVE_PRODUTOS
        );


    if (!produtosSalvos) {

        produtos = [];

        return;

    }


    try {

        produtos =
            JSON.parse(
                produtosSalvos
            );

    } catch (erro) {

        produtos = [];

    }

}



/* =========================================
   MOSTRAR PRODUTOS
========================================= */

function mostrarProdutos() {

    const busca =
        campoBusca.value
            .trim()
            .toLowerCase();


    let produtosFiltrados =
        produtos.filter(
            produto => {

                const correspondeCategoria =
                    categoriaAtual === "Todos" ||
                    produto.categoria === categoriaAtual;


                const correspondeBusca =
                    produto.nome
                        .toLowerCase()
                        .includes(busca);


                return (
                    correspondeCategoria &&
                    correspondeBusca
                );

            }
        );


    gradeProdutos.innerHTML = "";


    if (
        produtosFiltrados.length === 0
    ) {

        semProdutos.style.display =
            "flex";

        return;

    }


    semProdutos.style.display =
        "none";


    produtosFiltrados.forEach(
        produto => {

            criarCardProduto(
                produto
            );

        }
    );

}



/* =========================================
   CARD DO PRODUTO
========================================= */

function criarCardProduto(produto) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "produto";


    let imagemHTML;


    if (produto.imagem) {

        imagemHTML = `

            <img
                src="${produto.imagem}"
                alt="${produto.nome}"
                class="imagem-real-produto"
            >

        `;

    } else {

        imagemHTML = `

            <div class="produto-sem-foto">
                FOTO
            </div>

        `;

    }



    let botaoHTML;

    let statusHTML = "";



    if (produto.estoque) {

        botaoHTML = `

            <button
                class="botao-adicionar"
                onclick="adicionarProduto(${produto.id})"
            >
                +
            </button>

        `;

    } else {

        statusHTML = `

            <div class="produto-esgotado">
                ESGOTADO
            </div>

        `;


        botaoHTML = `

            <button
                class="botao-adicionar desativado"
                disabled
            >
                +
            </button>

        `;

    }



    card.innerHTML = `

        <div class="imagem-produto">

            ${imagemHTML}

            ${statusHTML}

        </div>


        <div class="informacoes-produto">

            <span class="categoria-produto">
                ${produto.categoria}
            </span>


            <h3>
                ${produto.nome}
            </h3>


            <p class="descricao-produto">

                ${
                    produto.descricao ||
                    "Produto selecionado especialmente para você."
                }

            </p>


            <div class="parte-inferior">

                <strong>
                    R$ ${formatarPreco(produto.preco)}
                </strong>


                ${botaoHTML}

            </div>

        </div>

    `;


    gradeProdutos.appendChild(
        card
    );

}



/* =========================================
   CATEGORIAS
========================================= */

const botoesCategoria =
    document.querySelectorAll(
        ".categoria"
    );


botoesCategoria.forEach(
    botao => {

        botao.addEventListener(
            "click",
            function () {

                botoesCategoria.forEach(
                    item => {
                        item.classList.remove(
                            "ativa"
                        );
                    }
                );


                this.classList.add(
                    "ativa"
                );


                categoriaAtual =
                    this.dataset.categoria;


                atualizarNomeFiltro();

                mostrarProdutos();

            }
        );

    }
);



/* =========================================
   NOME DO FILTRO
========================================= */

function atualizarNomeFiltro() {

    if (
        categoriaAtual === "Todos"
    ) {

        filtroAtual.textContent =
            "Todos os produtos";

    } else {

        filtroAtual.textContent =
            categoriaAtual;

    }

}



/* =========================================
   BUSCA
========================================= */

campoBusca.addEventListener(
    "input",
    function () {

        mostrarProdutos();

    }
);



/* =========================================
   ADICIONAR AO CARRINHO
========================================= */

function adicionarProduto(id) {

    carregarProdutos();


    const produto =
        produtos.find(
            item => item.id === id
        );


    if (!produto) return;


    if (!produto.estoque) {

        alert(
            "Este produto está sem estoque."
        );

        return;

    }


    const existente =
        carrinho.find(
            item => item.id === id
        );


    if (existente) {

        existente.quantidade++;

    } else {

        carrinho.push({

            id: produto.id,

            nome: produto.nome,

            preco: Number(
                produto.preco
            ),

            quantidade: 1

        });

    }


    atualizarCarrinho();

    abrirCarrinhoFuncao();

}



/* =========================================
   AUMENTAR QUANTIDADE
========================================= */

function aumentarQuantidade(id) {

    const item =
        carrinho.find(
            produto => produto.id === id
        );


    if (!item) return;


    item.quantidade++;


    atualizarCarrinho();

}



/* =========================================
   DIMINUIR QUANTIDADE
========================================= */

function diminuirQuantidade(id) {

    const item =
        carrinho.find(
            produto => produto.id === id
        );


    if (!item) return;


    if (item.quantidade > 1) {

        item.quantidade--;

    } else {

        carrinho =
            carrinho.filter(
                produto =>
                    produto.id !== id
            );

    }


    atualizarCarrinho();

}



/* =========================================
   REMOVER
========================================= */

function removerProduto(id) {

    carrinho =
        carrinho.filter(
            produto =>
                produto.id !== id
        );


    atualizarCarrinho();

}



/* =========================================
   ATUALIZAR CARRINHO
========================================= */

function atualizarCarrinho() {

    listaCarrinho.innerHTML = "";


    if (carrinho.length === 0) {

        listaCarrinho.innerHTML = `

            <div class="carrinho-vazio">

                <span>
                    🛍️
                </span>

                <p>
                    Seu carrinho está vazio.
                </p>

                <button
                    onclick="fecharCarrinhoFuncao()"
                >
                    Continuar comprando
                </button>

            </div>

        `;

    } else {


        carrinho.forEach(
            produto => {

                const subtotal =
                    produto.preco *
                    produto.quantidade;


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "item-carrinho";


                item.innerHTML = `

                    <div class="info-item-carrinho">

                        <h4>
                            ${produto.nome}
                        </h4>

                        <span>
                            R$ ${formatarPreco(
                                produto.preco
                            )}
                        </span>

                    </div>


                    <div class="controles-carrinho">

                        <button
                            onclick="diminuirQuantidade(${produto.id})"
                        >
                            −
                        </button>


                        <strong>
                            ${produto.quantidade}
                        </strong>


                        <button
                            onclick="aumentarQuantidade(${produto.id})"
                        >
                            +
                        </button>

                    </div>


                    <div class="subtotal-carrinho">

                        <strong>
                            R$ ${formatarPreco(
                                subtotal
                            )}
                        </strong>


                        <button
                            class="remover-item"
                            onclick="removerProduto(${produto.id})"
                        >
                            ×
                        </button>

                    </div>

                `;


                listaCarrinho.appendChild(
                    item
                );

            }
        );

    }


    atualizarTotal();

    atualizarQuantidade();

}



/* =========================================
   TOTAL
========================================= */

function atualizarTotal() {

    let total = 0;


    carrinho.forEach(
        produto => {

            total +=
                produto.preco *
                produto.quantidade;

        }
    );


    totalCarrinho.textContent =
        "R$ " +
        formatarPreco(total);

}



/* =========================================
   QUANTIDADE TOTAL
========================================= */

function atualizarQuantidade() {

    let quantidade = 0;


    carrinho.forEach(
        produto => {

            quantidade +=
                produto.quantidade;

        }
    );


    quantidadeCarrinho.textContent =
        quantidade;

}



/* =========================================
   ABRIR CARRINHO
========================================= */

function abrirCarrinhoFuncao() {

    carrinhoElemento.classList.add(
        "aberto"
    );


    fundoCarrinho.classList.add(
        "aberto"
    );


    document.body.style.overflow =
        "hidden";

}



/* =========================================
   FECHAR CARRINHO
========================================= */

function fecharCarrinhoFuncao() {

    carrinhoElemento.classList.remove(
        "aberto"
    );


    fundoCarrinho.classList.remove(
        "aberto"
    );


    document.body.style.overflow =
        "";

}



/* =========================================
   EVENTOS CARRINHO
========================================= */

abrirCarrinho.addEventListener(
    "click",
    abrirCarrinhoFuncao
);


fecharCarrinho.addEventListener(
    "click",
    fecharCarrinhoFuncao
);


fundoCarrinho.addEventListener(
    "click",
    fecharCarrinhoFuncao
);


verProdutos.addEventListener(
    "click",
    function () {

        document
            .getElementById("produtos")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);



/* =========================================
   FORMATAR PREÇO
========================================= */

function formatarPreco(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}



/* =========================================
   ENVIAR WHATSAPP
========================================= */

function enviarWhatsApp() {

    if (carrinho.length === 0) {

        alert(
            "Adicione pelo menos um produto ao pedido."
        );

        return;

    }


    const nome =
        document.getElementById(
            "nomeCliente"
        ).value.trim();


    const observacao =
        document.getElementById(
            "observacaoPedido"
        ).value.trim();


    if (!nome) {

        alert(
            "Digite seu nome antes de enviar o pedido."
        );


        document
            .getElementById(
                "nomeCliente"
            )
            .focus();


        return;

    }



    let total = 0;


    let mensagem =
        `Olá! Sou ${nome} e gostaria de fazer um pedido na CARÔ BEAUTY.\n\n`;


    mensagem +=
        "*Meu pedido:*\n\n";


    carrinho.forEach(
        produto => {

            const subtotal =
                produto.preco *
                produto.quantidade;


            total += subtotal;


            mensagem +=
                `• ${produto.quantidade}x ${produto.nome} — R$ ${formatarPreco(subtotal)}\n`;

        }
    );


    mensagem +=
        `\n*Total: R$ ${formatarPreco(total)}*`;


    if (observacao) {

        mensagem +=
            `\n\n*Observação:*\n${observacao}`;

    }


    /*
       =================================
       COLOQUE O WHATSAPP DA LOJA AQUI
       =================================
    */

    const numeroWhatsApp =
        "5516993340999";    


    const url =
        "https://wa.me/" +
        numeroWhatsApp +
        "?text=" +
        encodeURIComponent(
            mensagem
        );


    window.open(
        url,
        "_blank"
    );

}