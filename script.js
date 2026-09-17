// ==========================================
// CARÔ BEAUTY - CATÁLOGO
// Supabase + Carrinho + WhatsApp
// ==========================================

const SUPABASE_URL = "https://ehxqgrhpgizekwbqrdwp.supabase.co";

// CHAVE PÚBLICA DO SUPABASE
const SUPABASE_ANON_KEY = "sb_publishable_sYXKhTNj_j6sSGSZkwNkAg_i1P5UAGO";

const WHATSAPP = "5516993340999";

let supabaseClient;
let produtos = [];
let produtosFiltrados = [];
let carrinho = [];


// ==========================================
// INICIAR SUPABASE
// ==========================================

function iniciarSupabase() {

    if (!window.supabase) {

        const script = document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = () => {
            criarClienteSupabase();
        };

        document.head.appendChild(script);

    } else {

        criarClienteSupabase();

    }
}


function criarClienteSupabase() {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

    carregarProdutos();

}


// ==========================================
// CARREGAR PRODUTOS DO SUPABASE
// ==========================================

async function carregarProdutos() {

    const grade =
        document.getElementById("gradeProdutos");

    const semProdutos =
        document.getElementById("semProdutos");

    try {

        const { data, error } =
            await supabaseClient
                .from("produtos")
                .select("*")
                .order("created_at", {
                    ascending: false
                });

        if (error) {

            console.error(
                "Erro ao carregar produtos:",
                error
            );

            return;
        }


        produtos = (data || []).map(produto => ({

            id: produto.id,

            nome: produto.nome || "",

            descricao: produto.descricao || "",

            preco: Number(produto.preco || 0),

            categoria: produto.categoria || "Outros",

            imagem: produto.imagem_url || "",

            estoque: produto.estoque === true

        }));


        produtosFiltrados = [...produtos];

        renderizarProdutos();


    } catch (erro) {

        console.error(
            "Erro ao conectar ao Supabase:",
            erro
        );

    }
}


// ==========================================
// RENDERIZAR PRODUTOS
// ==========================================

function renderizarProdutos() {

    const grade =
        document.getElementById("gradeProdutos");

    const semProdutos =
        document.getElementById("semProdutos");

    if (!grade) return;


    grade.innerHTML = "";


    if (produtosFiltrados.length === 0) {

        if (semProdutos) {
            semProdutos.style.display = "block";
        }

        return;
    }


    if (semProdutos) {
        semProdutos.style.display = "none";
    }


    produtosFiltrados.forEach(produto => {

        const card =
            document.createElement("article");


        // ESTA CLASSE É A MESMA DO SEU CSS
        card.className = produto.estoque
    ? "produto"
    : "produto sem-estoque";


        const preco =
            Number(produto.preco || 0)
                .toFixed(2)
                .replace(".", ",");


        // ======================================
        // IMAGEM
        // ======================================

        let imagemHTML = "";


       if (produto.imagem) {

    imagemHTML = `
        <div class="imagem-produto">
            <img
                src="${produto.imagem}"
                alt="${produto.nome}"
            >
        </div>
    `;

       } else {

            imagemHTML = `
                <div class="imagem-produto">
                    <span class="produto-sem-foto">
                        CARÔ BEAUTY
                    </span>
                </div>
            `;

        }


        // ======================================
        // BOTÃO
        // ======================================

        let botaoHTML = "";


        if (produto.estoque) {

            botaoHTML = `
                <button
                    class="botao-adicionar"
                    onclick="adicionarAoCarrinho(${produto.id})"
                    aria-label="Adicionar ${produto.nome}"
                >
                    +
                </button>
            `;

        } else {

            botaoHTML = `
                <button
                    class="botao-adicionar"
                    disabled
                    title="Produto sem estoque"
                >
                    ×
                </button>
            `;

        }


        // ======================================
        // CARD
        // ======================================

        card.innerHTML = `

            ${imagemHTML}

            <div class="informacoes-produto">

                <span class="categoria-produto">
                    ${produto.categoria}
                </span>

                <h3>
                    ${produto.nome}
                </h3>

                <p class="descricao-produto">
                    ${produto.descricao}
                </p>

                <div class="parte-inferior">

                    <strong>
                        R$ ${preco}
                    </strong>

                    ${botaoHTML}

                </div>

            </div>

        `;


        grade.appendChild(card);

    });

}


// ==========================================
// PESQUISA
// ==========================================

function pesquisarProdutos() {

    const campo =
        document.getElementById("campoBusca");

    if (!campo) return;


    const busca =
        campo.value
            .toLowerCase()
            .trim();


    produtosFiltrados =
        produtos.filter(produto =>

            produto.nome
                .toLowerCase()
                .includes(busca)

            ||

            produto.descricao
                .toLowerCase()
                .includes(busca)

            ||

            produto.categoria
                .toLowerCase()
                .includes(busca)

        );


    atualizarTextoFiltro();

    renderizarProdutos();

}


// ==========================================
// CATEGORIAS
// ==========================================

function filtrarCategoria(categoria) {

    if (categoria === "Todos") {

        produtosFiltrados =
            [...produtos];

    } else {

        produtosFiltrados =
            produtos.filter(
                produto =>
                    produto.categoria === categoria
            );

    }


    // Atualiza botão ativo

    document
        .querySelectorAll(".categoria")
        .forEach(botao => {

            botao.classList.remove("ativa");

            if (
                botao.dataset.categoria === categoria
            ) {

                botao.classList.add("ativa");

            }

        });


    atualizarTextoFiltro(categoria);

    renderizarProdutos();

}


// ==========================================
// TEXTO DO FILTRO
// ==========================================

function atualizarTextoFiltro(categoria) {

    const filtro =
        document.getElementById("filtroAtual");

    if (!filtro) return;


    if (categoria) {

        filtro.textContent =
            categoria === "Todos"
                ? "Todos os produtos"
                : categoria;

    } else {

        filtro.textContent =
            "Todos os produtos";

    }

}


// ==========================================
// CARRINHO
// ==========================================

function adicionarAoCarrinho(id) {

    const produto =
        produtos.find(
            item => item.id === id
        );


    if (!produto || !produto.estoque) {
        return;
    }


    const item =
        carrinho.find(
            item => item.id === id
        );


    if (item) {

        item.quantidade++;

    } else {

        carrinho.push({

            id: produto.id,

            nome: produto.nome,

            preco: Number(produto.preco),

            quantidade: 1

        });

    }


    atualizarCarrinho();

    abrirCarrinho();

}


// ==========================================
// AUMENTAR
// ==========================================

function aumentarQuantidade(id) {

    const item =
        carrinho.find(
            produto => produto.id === id
        );

    if (!item) return;


    item.quantidade++;

    atualizarCarrinho();

}


// ==========================================
// DIMINUIR
// ==========================================

function diminuirQuantidade(id) {

    const item =
        carrinho.find(
            produto => produto.id === id
        );

    if (!item) return;


    item.quantidade--;


    if (item.quantidade <= 0) {

        carrinho =
            carrinho.filter(
                produto => produto.id !== id
            );

    }


    atualizarCarrinho();

}


// ==========================================
// REMOVER
// ==========================================

function removerDoCarrinho(id) {

    carrinho =
        carrinho.filter(
            produto => produto.id !== id
        );


    atualizarCarrinho();

}


// ==========================================
// ATUALIZAR CARRINHO
// ==========================================

function atualizarCarrinho() {

    const lista =
        document.getElementById("listaCarrinho");

    const contador =
        document.getElementById("quantidadeCarrinho");

    const totalElement =
        document.getElementById("totalCarrinho");


    if (!lista) return;


    // Se estiver vazio

    if (carrinho.length === 0) {

        lista.innerHTML = `

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

        lista.innerHTML = "";


        carrinho.forEach(item => {

            const subtotal =
                item.preco * item.quantidade;


            const div =
                document.createElement("div");


            div.className =
                "item-carrinho";


            div.innerHTML = `

                <div>

                    <h4>
                        ${item.nome}
                    </h4>

                    <p>
                        ${item.quantidade}x
                        R$ ${item.preco
                            .toFixed(2)
                            .replace(".", ",")}
                    </p>

                </div>


                <div>

                    <strong>
                        R$ ${subtotal
                            .toFixed(2)
                            .replace(".", ",")}
                    </strong>


                    <button
                        class="remover-item"
                        onclick="removerDoCarrinho(${item.id})"
                    >
                        ×
                    </button>

                </div>

            `;


            lista.appendChild(div);

        });

    }


    // ======================================
    // CONTADOR
    // ======================================

    let quantidadeTotal = 0;

    let total = 0;


    carrinho.forEach(item => {

        quantidadeTotal +=
            item.quantidade;

        total +=
            item.preco * item.quantidade;

    });


    if (contador) {

        contador.textContent =
            quantidadeTotal;

    }


    if (totalElement) {

        totalElement.textContent =
            "R$ " +
            total
                .toFixed(2)
                .replace(".", ",");

    }

}


// ==========================================
// ABRIR CARRINHO
// ==========================================

function abrirCarrinho() {

    const carrinhoElement =
        document.getElementById("carrinho");

    const fundo =
        document.getElementById("fundoCarrinho");


    if (carrinhoElement) {

        carrinhoElement.classList.add("aberto");

    }


    if (fundo) {

        fundo.classList.add("aberto");

    }

}


// ==========================================
// FECHAR CARRINHO
// ==========================================

function fecharCarrinhoFuncao() {

    const carrinhoElement =
        document.getElementById("carrinho");

    const fundo =
        document.getElementById("fundoCarrinho");


    if (carrinhoElement) {

        carrinhoElement.classList.remove("aberto");

    }


    if (fundo) {

        fundo.classList.remove("aberto");

    }

}


// ==========================================
// WHATSAPP
// ==========================================

function enviarWhatsApp() {

    if (carrinho.length === 0) {

        alert(
            "Seu carrinho está vazio."
        );

        return;

    }


    const nomeInput =
        document.getElementById("nomeCliente");


    const observacaoInput =
        document.getElementById("observacaoPedido");


    const nome =
        nomeInput
            ? nomeInput.value.trim()
            : "";


    const observacao =
        observacaoInput
            ? observacaoInput.value.trim()
            : "";


    let mensagem =
        "Olá! Gostaria de fazer um pedido na CARÔ BEAUTY.\n\n";


    if (nome) {

        mensagem +=
            `Nome: ${nome}\n\n`;

    }


    mensagem +=
        "Pedido:\n";


    let total = 0;


    carrinho.forEach(item => {

        const subtotal =
            item.preco * item.quantidade;


        total += subtotal;


        mensagem +=
            `${item.quantidade}x ${item.nome} - R$ ${subtotal
                .toFixed(2)
                .replace(".", ",")}\n`;

    });


    mensagem +=
        `\nTotal: R$ ${total
            .toFixed(2)
            .replace(".", ",")}`;


    if (observacao) {

        mensagem +=
            `\n\nObservação:\n${observacao}`;

    }


    const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;


    window.open(
        url,
        "_blank"
    );

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Supabase
        iniciarSupabase();


        // Pesquisa

        const campoBusca =
            document.getElementById("campoBusca");


        if (campoBusca) {

            campoBusca.addEventListener(
                "input",
                pesquisarProdutos
            );

        }


        // Categorias

        const botoesCategoria =
            document.querySelectorAll(
                ".categoria"
            );


        botoesCategoria.forEach(botao => {

            botao.addEventListener(
                "click",
                () => {

                    filtrarCategoria(
                        botao.dataset.categoria
                    );

                }
            );

        });


        // Botão VER PRODUTOS

        const verProdutos =
            document.getElementById("verProdutos");


        const produtosSection =
            document.getElementById("produtos");


        if (verProdutos && produtosSection) {

            verProdutos.addEventListener(
                "click",
                () => {

                    produtosSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }
            );

        }


        // Botão do carrinho

        const abrirCarrinhoBotao =
            document.getElementById("abrirCarrinho");


        if (abrirCarrinhoBotao) {

            abrirCarrinhoBotao.addEventListener(
                "click",
                abrirCarrinho
            );

        }


        // Fechar carrinho

        const fecharCarrinhoBotao =
            document.getElementById("fecharCarrinho");


        if (fecharCarrinhoBotao) {

            fecharCarrinhoBotao.addEventListener(
                "click",
                fecharCarrinhoFuncao
            );

        }


        // Fundo do carrinho

        const fundo =
            document.getElementById("fundoCarrinho");


        if (fundo) {

            fundo.addEventListener(
                "click",
                fecharCarrinhoFuncao
            );

        }


        atualizarCarrinho();

    }
);
